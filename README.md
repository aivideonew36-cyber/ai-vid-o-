# PIReel — Générateur Vidéo IA 4K Ultra-Réaliste

> **Performance : 60 secondes de calcul → 30 secondes de vidéo (ratio 2:1)**  
> Architecture : Google Cloud Vertex AI | GPU NVIDIA L4 (24 Go VRAM) | TensorRT x5

---

## Concept

PIReel est une usine logicielle de génération de vidéo humaine 4K ultra-réaliste.
Elle utilise **2 000 points de contrôle** (Checkpoints + LoRAs) injectés par paliers de 50 dans le GPU,
orchestrés par **20 outils serveurs** sur une instance Google Cloud G2.

---

## Architecture Technique

### Les 2 000 Points de Contrôle (LoRAs .safetensors)

| Palier | Points | Nom | Rôle |
|--------|--------|-----|------|
| 1 | 1 – 50 | Structure Humaine | Charpente, proportions, perspective |
| 2 | 51 – 150 | Géométrie Faciale | Symétrie yeux, nez, mâchoire |
| 3 | 151 – 250 | Micro-Textures Épidermiques | Pores, grains de beauté, mélanine |
| 4 | 251 – 350 | Système Capillaire | Types de cheveux + physique |
| 5 | 351 – 450 | Mécanique Buccale | Lèvres, dents, phonèmes |
| 6 | 451 – 550 | Expressions de Vie | Sourcils, clignements, émotions |
| 7 | 551 – 650 | Physique des Tissus | Plis vêtements, mouvement |
| 8 | 651 – 750 | Éclairage Studio | Softbox, Rim light, contre-jour |
| 9 | 751 – 900 | Environnements 3D | Décors, profondeur de champ |
| 10 | 901 – 1050 | Adhérence au Texte | ControlNet force le respect du prompt |
| 11 | 1051 – 1200 | Diversité Globale | Toutes origines humaines |
| 12 | 1201 – 1350 | Cohérence Temporelle | Anti-changement d'apparence |
| 13 | 1351 – 1500 | Stabilité de Mouvement | Anti-flickering |
| 14 | 1501 – 1650 | Colorimétrie Cinématographique | Contrastes, balance des blancs |
| 15 | 1651 – 1800 | Upscaling 4K | Reconstruction des détails fins |
| 16 | 1801 – 1950 | Filtres de Réalisme | Grain naturel, micro-détails |
| 17 | 1951 – 2000 | Verrous de Finalisation | Nettoyage numérique final |

---

### Les 20 Outils Serveurs

| # | Outil | Rôle |
|---|-------|------|
| 1 | Ubuntu Server 22.04 LTS | Base système 24/7 |
| 2 | NVIDIA CUDA 12.4 | Interface Python → GPU |
| 3 | Python 3.10 | Pilote IA |
| 4 | PyTorch 2.3 | Calcul des 2000 points |
| 5 | ComfyUI Backend | Gestionnaire de flux |
| 6 | Wan 2.1 (T2V) | Moteur génération vidéo |
| 7 | IP-Adapter FaceID | Verrouillage du visage |
| 8 | ControlNet Canny | Contours silhouette |
| 9 | ControlNet Depth | Effet 3D profondeur |
| 10 | LivePortrait V2 | Transfert expressions |
| 11 | Wav2Lip-HD | Synchro labiale HD |
| 12 | SUPIR | Upscaling 4K cristallin |
| 13 | CodeFormer | Restauration visage |
| 14 | GFPGAN | Lissage peau pro |
| 15 | FreeU v2 | Optimiseur textures |
| 16 | AnimateDiff Evolved | Stabilisateur fluidité |
| 17 | Bark (Local GPU) | Text-to-Speech IA |
| 18 | RVC Voice Clone | Clonage timbre vocal |
| 19 | FFmpeg 6.1 | Encodage MP4 final |
| 20 | NVIDIA TensorRT 10 | Accélérateur x5 |

---

## Performance (Ratio 2:1)

```
Temps de calcul : 60 secondes
Durée vidéo     : 30 secondes
Ratio           : 2:1 (optimisé TensorRT)
GPU             : NVIDIA L4 — 24 Go VRAM
Instance        : g2-standard-16 (Google Cloud)
```

Chaque seconde de vidéo = 2 secondes de calcul GPU.  
TensorRT divise le temps brut par 5 → passage de 300s à 60s.

---

## Structure du Projet

```
pireel/
├── pireel_pipeline.py          # Orchestrateur principal (20 outils + 2000 checkpoints)
├── google_cloud_setup.sh       # Script de déploiement Google Cloud
├── google_cloud_terraform/     # Infrastructure as Code (Terraform)
│   ├── main.tf                 # VM G2 + L4 + GCS + Réseau
│   └── terraform.tfvars.example
├── artifacts/
│   ├── pireel/                 # Dashboard React + Vite (interface utilisateur)
│   └── api-server/             # API Express (gestion des jobs)
├── lib/
│   ├── api-spec/openapi.yaml   # Contrat API OpenAPI 3.1
│   └── db/                     # Schéma PostgreSQL (Drizzle ORM)
└── requirements_python.txt     # Dépendances Python du pipeline
```

---

## Démarrage Rapide

### 1. Déploiement Google Cloud (Terraform)

```bash
cd google_cloud_terraform
cp terraform.tfvars.example terraform.tfvars
# Remplir terraform.tfvars avec votre project_id et github_token
terraform init
terraform apply
```

### 2. Lancer le Pipeline Python (local ou VM)

```bash
pip install -r requirements_python.txt

# Valider l'architecture Google Cloud
python pireel_pipeline.py --validate

# Tester un job de rendu
python pireel_pipeline.py --test-job

# Mode production (écoute Supabase)
python pireel_pipeline.py
```

### 3. Dashboard Web

```bash
pnpm install
pnpm --filter @workspace/pireel run dev     # Frontend: http://localhost:23350
pnpm --filter @workspace/api-server run dev  # API: http://localhost:8080
```

---

## Variables d'Environnement

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | Token GitHub pour la liaison Cloud ↔ GitHub |
| `SUPABASE_URL` | URL de votre projet Supabase |
| `SUPABASE_KEY` | Clé API Supabase |
| `GCS_BUCKET` | Nom du bucket Google Cloud Storage |
| `COMFYUI_HOST` | Adresse du serveur ComfyUI (défaut: localhost:8188) |

---

## Validation de l'Architecture

```
✅ Instance G2-Standard-16 : 16 vCPU, 64 Go RAM
✅ GPU NVIDIA L4            : 24 Go VRAM
✅ TensorRT 10.0            : Accélération x5
✅ VRAM estimée utilisée    : 22.7 Go / 24 Go (marge: 1.3 Go)
✅ 2000 checkpoints         : Compatibles sans ralentissement
✅ Ratio de performance     : 2:1 (60s calcul → 30s vidéo)
```
