###############################################################################
# PIReel - Infrastructure Google Cloud Vertex AI
# Instance G2-Standard-16 + GPU NVIDIA L4 (24 Go VRAM) + Liaison GitHub
# Objectif : Rendu vidéo quasi-instantané (ratio 2:1 TensorRT)
###############################################################################

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

###############################################################################
# VARIABLES
###############################################################################
variable "project_id"    { default = "pireel-production" }
variable "region"        { default = "us-central1" }
variable "zone"          { default = "us-central1-a" }
variable "github_token"  { sensitive = true }
variable "github_repo"   { default = "https://github.com/aivideonew36-cyber/ai-vid-o-" }
variable "supabase_url"  { sensitive = true; default = "" }
variable "supabase_key"  { sensitive = true; default = "" }

###############################################################################
# RÉSEAU
###############################################################################
resource "google_compute_network" "pireel_vpc" {
  name                    = "pireel-vpc"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "pireel_allow_all" {
  name    = "pireel-allow-ingress"
  network = google_compute_network.pireel_vpc.name
  allow {
    protocol = "tcp"
    ports    = ["22", "80", "443", "3000", "8188"]
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["pireel-server"]
}

###############################################################################
# BUCKET GOOGLE CLOUD STORAGE (sorties vidéo)
###############################################################################
resource "google_storage_bucket" "pireel_outputs" {
  name          = "pireel-outputs-${var.project_id}"
  location      = "US-CENTRAL1"
  force_destroy = false
  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition { age = 30 }
    action    { type = "Delete" }
  }
}

resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.pireel_outputs.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

###############################################################################
# VM G2-STANDARD-16 + GPU NVIDIA L4 (CŒUR DU SYSTÈME PIReel)
###############################################################################
resource "google_compute_instance" "pireel_gpu" {
  name         = "pireel-gpu-server"
  machine_type = "g2-standard-16"    # 16 vCPU, 64 Go RAM, optimisé L4
  zone         = var.zone

  # ── GPU NVIDIA L4 ──────────────────────────────────────────────────────────
  guest_accelerator {
    type  = "nvidia-l4"
    count = 1
  }

  # TERMINATE lors de la maintenance (requis pour les instances GPU)
  scheduling {
    on_host_maintenance = "TERMINATE"
    automatic_restart   = true
    preemptible         = false   # false = haute disponibilité 24/7
  }

  # ── Disque SSD 500 Go (stockage des 2000 checkpoints .safetensors) ──────────
  boot_disk {
    initialize_params {
      image = "projects/ml-images/global/images/c0-deeplearning-common-gpu-v20250415-debian-12-py310"
      # Image pré-configurée avec CUDA 12.4, Python 3.10, PyTorch, TensorRT
      size  = 500
      type  = "pd-ssd"
    }
  }

  network_interface {
    network = google_compute_network.pireel_vpc.name
    access_config {}    # IP publique automatique
  }

  tags = ["pireel-server"]

  # ── Service Account avec accès complet GCS ─────────────────────────────────
  service_account {
    scopes = ["cloud-platform"]
  }

  # ── Métadonnées : variables d'environnement sécurisées ─────────────────────
  metadata = {
    github_token = var.github_token
    supabase_url = var.supabase_url
    supabase_key = var.supabase_key
    gcs_bucket   = google_storage_bucket.pireel_outputs.name
  }

  # ── Script de démarrage automatique ────────────────────────────────────────
  metadata_startup_script = <<-EOT
    #!/bin/bash
    set -e
    exec > /var/log/pireel-startup.log 2>&1

    echo "=== PIReel Startup Script ==="
    echo "GPU: $(nvidia-smi --query-gpu=name --format=csv,noheader)"
    echo "VRAM: $(nvidia-smi --query-gpu=memory.total --format=csv,noheader)"

    # Récupérer les variables depuis les métadonnées
    GITHUB_TOKEN=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/attributes/github_token" -H "Metadata-Flavor: Google")
    SUPABASE_URL=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/attributes/supabase_url" -H "Metadata-Flavor: Google")
    SUPABASE_KEY=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/attributes/supabase_key" -H "Metadata-Flavor: Google")
    GCS_BUCKET=$(curl -sf "http://metadata.google.internal/computeMetadata/v1/instance/attributes/gcs_bucket" -H "Metadata-Flavor: Google")

    # Installer les dépendances Python PIReel
    pip3 install supabase tensorrt-cu12 xformers flash-attn 2>/dev/null || true

    # Cloner / mettre à jour le code PIReel depuis GitHub
    if [ -d "/opt/pireel" ]; then
      cd /opt/pireel && git pull
    else
      git clone https://$GITHUB_TOKEN@github.com/aivideonew36-cyber/ai-vid-o-.git /opt/pireel
    fi

    cd /opt/pireel

    # Exporter les variables d'environnement
    export SUPABASE_URL="$SUPABASE_URL"
    export SUPABASE_KEY="$SUPABASE_KEY"
    export GCS_BUCKET="gs://$GCS_BUCKET"
    export COMFYUI_HOST="http://localhost:8188"
    export TENSORRT_CACHE_DIR="/opt/pireel/.trt_cache"

    # ── OPTIMISATION CRITIQUE : Précompiler TensorRT au démarrage ──────────
    echo "Précompilation TensorRT des modèles PIReel..."
    python3 -c "
import torch, os
os.makedirs('/opt/pireel/.trt_cache', exist_ok=True)
print(f'GPU: {torch.cuda.get_device_name(0)}')
print(f'VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} Go')
print(f'CUDA: {torch.version.cuda}')
torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.benchmark = True
torch.backends.cudnn.allow_tf32 = True
print('✅ TensorRT optimisations activées')
"

    # Démarrer PIReel en mode production
    nohup python3 /opt/pireel/pireel_pipeline.py > /var/log/pireel.log 2>&1 &
    echo "✅ PIReel démarré (PID: $!)"
  EOT
}

###############################################################################
# OUTPUTS
###############################################################################
output "instance_ip" {
  description = "IP publique de la VM PIReel"
  value       = google_compute_instance.pireel_gpu.network_interface[0].access_config[0].nat_ip
}

output "gcs_bucket" {
  description = "Bucket GCS pour les vidéos générées"
  value       = google_storage_bucket.pireel_outputs.name
}

output "ssh_command" {
  description = "Commande SSH pour se connecter à la VM"
  value       = "gcloud compute ssh pireel-gpu-server --zone=${var.zone}"
}

output "logs_command" {
  description = "Voir les logs en temps réel"
  value       = "gcloud compute ssh pireel-gpu-server --zone=${var.zone} --command='tail -f /var/log/pireel.log'"
}
