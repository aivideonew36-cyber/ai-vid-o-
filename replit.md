# Workspace - PIReel

## Overview

PIReel est une plateforme de génération vidéo IA 4K ultra-réaliste.
Performance : 60 secondes de calcul → 30 secondes de vidéo (ratio 2:1).
Architecture : Google Cloud Vertex AI | GPU NVIDIA L4 (24 Go VRAM) | TensorRT.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + framer-motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (jobs, pipeline, health)
│   ├── pireel/             # PIReel Dashboard React+Vite (at /)
│   └── mockup-sandbox/     # UI prototyping sandbox
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── pireel_pipeline.py      # Script Python principal d'orchestration des 20 outils
└── scripts/                # Utility scripts
```

## PIReel - Architecture Technique

### 2 000 Points de Contrôle (Checkpoints / LoRAs)
Les 2000 fichiers .safetensors sont injectés par paliers de 50 dans le GPU:
- Points 1-50: Structure humaine
- Points 51-150: Géométrie faciale
- Points 151-250: Micro-textures épidermiques
- Points 251-350: Système capillaire
- Points 351-450: Mécanique buccale
- Points 451-550: Expressions de vie
- Points 551-650: Physique des tissus
- Points 651-750: Éclairage studio
- Points 751-900: Environnements 3D
- Points 901-1050: Adhérence au texte (prompt)
- Points 1051-1200: Diversité globale
- Points 1201-1350: Cohérence temporelle
- Points 1351-1500: Stabilité de mouvement
- Points 1501-1650: Colorimétrie cinématographique
- Points 1651-1800: Upscaling 4K
- Points 1801-1950: Filtres de réalisme
- Points 1951-2000: Verrous de finalisation

### 20 Outils Serveurs (Google Cloud)
Ubuntu Server, NVIDIA CUDA 12.4, Python 3.10, PyTorch, ComfyUI, Wan 2.1,
IP-Adapter FaceID, ControlNet Canny, ControlNet Depth, LivePortrait V2,
Wav2Lip-HD, SUPIR, CodeFormer, GFPGAN, FreeU v2, AnimateDiff Evolved,
Bark, RVC, FFmpeg, NVIDIA TensorRT.

### Script Python Principal
`pireel_pipeline.py` - Orchestre l'ensemble du pipeline.
Commandes:
- `python pireel_pipeline.py` - Mode production (lit les jobs depuis Supabase)
- `python pireel_pipeline.py --validate` - Valide l'architecture Google Cloud
- `python pireel_pipeline.py --test-job` - Test d'un job de rendu

## Database Schema

- `video_jobs` - Table des jobs de génération vidéo avec statut, progression,
  couche courante (0-2000), URL vidéo, temps de calcul.

## API Endpoints

- `GET /api/healthz` - Health check
- `GET /api/jobs` - Lister tous les jobs
- `POST /api/jobs` - Créer un nouveau job de génération
- `GET /api/jobs/:id` - Détail d'un job
- `DELETE /api/jobs/:id` - Supprimer un job
- `GET /api/pipeline/status` - Statut du pipeline GPU
- `GET /api/pipeline/checkpoints` - Les 17 couches de checkpoints
- `GET /api/pipeline/tools` - Les 20 outils serveurs

## Packages

### `artifacts/pireel` (`@workspace/pireel`)

Dashboard React+Vite pour PIReel.
- Pages: Dashboard, Nouveau Job, Jobs List, Job Detail, Pipeline Tools, Checkpoints
- Polling temps réel des jobs toutes les 2 secondes
- Simulation de progression des 2000 couches de checkpoints

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server.
- Routes: health, jobs, pipeline
- Simulation du traitement GPU (60s en temps réel)
- Mise à jour automatique de la progression couche par couche

### `lib/db` (`@workspace/db`)

- `video_jobs` table avec Drizzle ORM
