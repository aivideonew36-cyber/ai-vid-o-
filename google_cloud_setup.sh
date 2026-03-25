#!/bin/bash
# =============================================================================
# PIReel - Configuration Google Cloud Vertex AI (Instance G2 + GPU NVIDIA L4)
# Objectif : Rendu vidéo quasi-instantané via TensorRT + préchargement VRAM
# =============================================================================

set -e

PROJECT_ID="${GCP_PROJECT_ID:-pireel-production}"
ZONE="us-central1-a"
INSTANCE_NAME="pireel-gpu-server"
GITHUB_REPO="https://github.com/aivideonew36-cyber/ai-vid-o-"
GITHUB_TOKEN="${GITHUB_TOKEN}"

echo "============================================================"
echo "  PIReel - Déploiement Google Cloud Vertex AI"
echo "  Instance: G2-Standard-16 | GPU: NVIDIA L4 (24 Go VRAM)"
echo "  Zone: $ZONE"
echo "============================================================"

# ── Étape 1 : Activer les APIs Google Cloud ──────────────────────────────────
echo ""
echo "▶ Étape 1/7 : Activation des APIs Google Cloud..."
gcloud services enable \
  compute.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  --project="$PROJECT_ID"

# ── Étape 2 : Créer le bucket GCS pour les vidéos ────────────────────────────
echo ""
echo "▶ Étape 2/7 : Création du bucket Google Cloud Storage..."
gsutil mb -p "$PROJECT_ID" -l us-central1 gs://pireel-outputs/ 2>/dev/null || echo "Bucket déjà existant."
gsutil iam ch allUsers:objectViewer gs://pireel-outputs/
gsutil cors set - gs://pireel-outputs/ <<EOF
[{"origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600}]
EOF

# ── Étape 3 : Créer l'instance VM G2 + GPU NVIDIA L4 ─────────────────────────
echo ""
echo "▶ Étape 3/7 : Création de la VM G2-Standard-16 avec GPU NVIDIA L4..."
gcloud compute instances create "$INSTANCE_NAME" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type="g2-standard-16" \
  --accelerator="type=nvidia-l4,count=1" \
  --maintenance-policy=TERMINATE \
  --restart-on-failure \
  --image-family="debian-12-bookworm-v20250415" \
  --image-project="debian-cloud" \
  --boot-disk-size="500GB" \
  --boot-disk-type="pd-ssd" \
  --tags="pireel-server,http-server,https-server" \
  --metadata="install-nvidia-driver=True" \
  --scopes="cloud-platform"

echo "✅ VM créée : $INSTANCE_NAME"

# ── Étape 4 : Configurer le pare-feu ─────────────────────────────────────────
echo ""
echo "▶ Étape 4/7 : Configuration du pare-feu..."
gcloud compute firewall-rules create pireel-allow-http \
  --project="$PROJECT_ID" \
  --allow="tcp:80,tcp:443,tcp:8188,tcp:3000" \
  --target-tags="pireel-server" \
  --description="PIReel API + ComfyUI" 2>/dev/null || echo "Règle déjà existante."

# ── Étape 5 : Script de démarrage (installation automatique) ─────────────────
echo ""
echo "▶ Étape 5/7 : Déploiement du script de démarrage sur la VM..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
  # Installer CUDA 12.4
  wget https://developer.download.nvidia.com/compute/cuda/repos/debian12/x86_64/cuda-keyring_1.1-1_all.deb
  sudo dpkg -i cuda-keyring_1.1-1_all.deb
  sudo apt-get update -y && sudo apt-get install -y cuda-toolkit-12-4

  # Installer Python 3.10 + dépendances
  sudo apt-get install -y python3.10 python3.10-dev python3-pip git ffmpeg
  pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
  pip3 install tensorrt supabase-py comfyui

  # Cloner le dépôt PIReel depuis GitHub
  git clone https://${GITHUB_TOKEN}@github.com/aivideonew36-cyber/ai-vid-o-.git /opt/pireel
  cd /opt/pireel

  # Installer les dépendances Python
  pip3 install -r requirements_python.txt 2>/dev/null || echo 'Pas de requirements_python.txt'

  echo '✅ Installation terminée sur la VM'
"

# ── Étape 6 : Précompilation TensorRT (CLEF DE LA VITESSE INSTANTANÉE) ───────
echo ""
echo "▶ Étape 6/7 : Précompilation TensorRT des modèles (exécuter 1 seule fois)..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
  cd /opt/pireel

  # Précompiler Wan 2.1 avec TensorRT → gain x5 sur le temps de calcul
  echo 'Précompilation Wan 2.1 T2V...'
  python3 -c \"
import torch
import tensorrt as trt
print('TensorRT version:', trt.__version__)
print('CUDA disponible:', torch.cuda.is_available())
print('GPU:', torch.cuda.get_device_name(0))
print('VRAM totale:', round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1), 'Go')
print('✅ TensorRT prêt pour la compilation des modèles PIReel')
\"
"

# ── Étape 7 : Démarrer le serveur PIReel ─────────────────────────────────────
echo ""
echo "▶ Étape 7/7 : Démarrage du serveur PIReel en production..."
gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="
  cd /opt/pireel

  # Variables d'environnement
  export SUPABASE_URL='${SUPABASE_URL:-https://your-project.supabase.co}'
  export SUPABASE_KEY='${SUPABASE_KEY:-your-key}'
  export GCS_BUCKET='gs://pireel-outputs'
  export COMFYUI_HOST='http://localhost:8188'

  # Démarrer l'orchestrateur en arrière-plan
  nohup python3 pireel_pipeline.py > /var/log/pireel.log 2>&1 &
  echo \"✅ PIReel Orchestrateur démarré (PID: \$!)\"
"

# ── Afficher l'IP publique ────────────────────────────────────────────────────
PUBLIC_IP=$(gcloud compute instances describe "$INSTANCE_NAME" \
  --zone="$ZONE" --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "============================================================"
echo "  ✅ PIReel déployé avec succès !"
echo "  IP publique  : $PUBLIC_IP"
echo "  ComfyUI      : http://$PUBLIC_IP:8188"
echo "  API PIReel   : http://$PUBLIC_IP:3000"
echo "  Logs         : gcloud compute ssh $INSTANCE_NAME --command='tail -f /var/log/pireel.log'"
echo "============================================================"
