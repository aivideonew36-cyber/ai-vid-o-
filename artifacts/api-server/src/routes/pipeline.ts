import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CHECKPOINT_LAYERS = [
  { rangeStart: 1, rangeEnd: 50, name: "Checkpoints de Structure", description: "Définition de la charpente humaine, des proportions du corps et des lois de la perspective.", category: "structure", loaded: true },
  { rangeStart: 51, rangeEnd: 150, name: "Géométrie Faciale", description: "Calibrage de la symétrie des yeux, de la forme du nez et de la structure de la mâchoire.", category: "facial", loaded: true },
  { rangeStart: 151, rangeEnd: 250, name: "Micro-Textures Épidermiques", description: "Détails des pores de la peau, des grains de beauté, et de la réflexion de la lumière sur le visage.", category: "skin", loaded: true },
  { rangeStart: 251, rangeEnd: 350, name: "Système Capillaire", description: "100 points dédiés aux types de cheveux (crépus, lisses, tresses) et à leur mouvement physique.", category: "hair", loaded: true },
  { rangeStart: 351, rangeEnd: 450, name: "Mécanique Buccale", description: "Points de contrôle pour le mouvement des lèvres, des dents et de la langue lors de la parole.", category: "mouth", loaded: true },
  { rangeStart: 451, rangeEnd: 550, name: "Expressions de Vie", description: "Micro-mouvements des sourcils, clignements d'yeux et expressions de joie ou de sérieux.", category: "expressions", loaded: true },
  { rangeStart: 551, rangeEnd: 650, name: "Physique des Tissus", description: "Gestion des plis des vêtements et de leur réaction aux mouvements du corps.", category: "clothing", loaded: true },
  { rangeStart: 651, rangeEnd: 750, name: "Éclairage Studio", description: "100 points pour simuler des lumières professionnelles (Softbox, Rim light, contre-jour).", category: "lighting", loaded: true },
  { rangeStart: 751, rangeEnd: 900, name: "Environnements 3D", description: "Catalogue de décors (bureaux, extérieurs, studios) avec gestion de la profondeur de champ.", category: "environment", loaded: true },
  { rangeStart: 901, rangeEnd: 1050, name: "Adhérence au Texte (Prompt)", description: "Points garantissant que chaque détail écrit par l'utilisateur est traduit visuellement sans erreur.", category: "text_adherence", loaded: true },
  { rangeStart: 1051, rangeEnd: 1200, name: "Diversité Globale", description: "Points permettant de représenter toutes les origines humaines avec un réalisme photographique.", category: "diversity", loaded: true },
  { rangeStart: 1201, rangeEnd: 1350, name: "Cohérence Temporelle", description: "Points qui empêchent le personnage de changer d'apparence durant les 30 secondes.", category: "temporal", loaded: true },
  { rangeStart: 1351, rangeEnd: 1500, name: "Stabilité de Mouvement", description: "Élimination des tremblements de l'image (flickering) pour une fluidité parfaite.", category: "motion", loaded: true },
  { rangeStart: 1501, rangeEnd: 1650, name: "Colorimétrie Cinématographique", description: "Calibration des contrastes et des balances de blancs pour un rendu pro.", category: "colorimetry", loaded: true },
  { rangeStart: 1651, rangeEnd: 1800, name: "Optimiseurs de Netteté (Upscaling)", description: "Points de reconstruction des détails fins pour la sortie 4K.", category: "upscaling", loaded: true },
  { rangeStart: 1801, rangeEnd: 1950, name: "Filtres de Réalisme", description: "Ajout de grain de peau naturel et de micro-détails atmosphériques.", category: "realism", loaded: true },
  { rangeStart: 1951, rangeEnd: 2000, name: "Verrous de Finalisation", description: "Nettoyage final des erreurs numériques avant l'exportation.", category: "finalization", loaded: true },
];

const SERVER_TOOLS = [
  { id: 1, name: "Ubuntu Server", description: "Base système pour une stabilité 24h/24", category: "OS", version: "22.04 LTS", status: "active", isCore: true },
  { id: 2, name: "NVIDIA CUDA", description: "Moteur GPU permettant au code Python de parler directement au GPU", category: "GPU", version: "12.4", status: "active", isCore: true },
  { id: 3, name: "Python", description: "Le seul langage utilisé pour piloter toute l'Intelligence Artificielle", category: "Runtime", version: "3.10", status: "active", isCore: true },
  { id: 4, name: "PyTorch", description: "Bibliothèque de calcul qui traite les 2 000 points de données", category: "ML", version: "2.3.0", status: "active", isCore: true },
  { id: 5, name: "ComfyUI Backend", description: "Gestionnaire de flux qui relie tous les outils entre eux", category: "Orchestration", version: "1.3.0", status: "active", isCore: true },
  { id: 6, name: "Wan 2.1 (T2V)", description: "Moteur de génération vidéo principal (Mouvement)", category: "AI Model", version: "2.1", status: "active", isCore: true },
  { id: 7, name: "IP-Adapter FaceID", description: "Verrouille le visage grâce aux points de contrôle", category: "AI Model", version: "1.0", status: "active", isCore: true },
  { id: 8, name: "ControlNet Canny", description: "Analyseur de contours pour garder une silhouette nette", category: "Control", version: "1.1", status: "active", isCore: false },
  { id: 9, name: "ControlNet Depth", description: "Générateur de profondeur pour l'effet 3D réel", category: "Control", version: "1.1", status: "active", isCore: false },
  { id: 10, name: "LivePortrait V2", description: "Transfert des expressions humaines sur l'avatar", category: "AI Model", version: "2.0", status: "active", isCore: true },
  { id: 11, name: "Wav2Lip-HD", description: "Synchronisation labiale haute définition", category: "Audio-Video", version: "HD", status: "active", isCore: true },
  { id: 12, name: "SUPIR", description: "Upscaler qui transforme l'image brute en 4K cristalline", category: "Upscaling", version: "1.0", status: "active", isCore: true },
  { id: 13, name: "CodeFormer", description: "Algorithme de restauration pour un visage ultra-net", category: "Restoration", version: "0.1.0", status: "active", isCore: false },
  { id: 14, name: "GFPGAN", description: "Lisseur de peau professionnel gardant le grain naturel", category: "Restoration", version: "1.3", status: "active", isCore: false },
  { id: 15, name: "FreeU v2", description: "Optimiseur de rendu pour les textures et les contrastes", category: "Optimization", version: "2.0", status: "active", isCore: false },
  { id: 16, name: "AnimateDiff Evolved", description: "Stabilisateur de la fluidité vidéo", category: "Video", version: "2.0", status: "active", isCore: true },
  { id: 17, name: "Bark (Local GPU)", description: "Générateur de voix humaine intégré au serveur (Text-to-Speech)", category: "Audio", version: "0.1.5", status: "active", isCore: false },
  { id: 18, name: "RVC (Voice Clone)", description: "Personnalisation du timbre vocal pour l'avatar", category: "Audio", version: "2.0", status: "active", isCore: false },
  { id: 19, name: "FFmpeg", description: "Monteur automatique qui assemble la vidéo, l'audio et l'encodage MP4", category: "Encoding", version: "6.1", status: "active", isCore: true },
  { id: 20, name: "NVIDIA TensorRT", description: "Accélérateur qui permet de diviser le temps de calcul par 5", category: "GPU", version: "10.0", status: "active", isCore: true },
];

router.get("/pipeline/status", (_req, res) => {
  res.json({
    isReady: true,
    gpuModel: "NVIDIA L4",
    vramTotal: 24,
    vramUsed: 18,
    checkpointsLoaded: 2000,
    activeJobs: 0,
    tensorrtEnabled: true,
    computeRatio: "2:1 (60s compute → 30s video)",
    cloudProvider: "Google Cloud",
    instanceType: "g2-standard-16 (L4 GPU)",
  });
});

router.get("/pipeline/checkpoints", (_req, res) => {
  res.json(CHECKPOINT_LAYERS);
});

router.get("/pipeline/tools", (_req, res) => {
  res.json(SERVER_TOOLS);
});

export default router;
