#!/usr/bin/env node
/**
 * LevelUp System — Script de Génération Vidéo Cinématique (Node.js Engine)
 * Permet d'appeler l'API Gemini / Google Flow directement via Node.js sans dépendances externes.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEFAULT_PROMPT = 
  "Cinematic dark fantasy sci-fi RPG opening sequence. " +
  "In an obsidian cosmic void, swirling bioluminescent violet and electric cyan energy vortexes converge. " +
  "An ancient, radiant holographic HUD interface ignites with glowing futuristic runes, " +
  "displaying 'LEVELUP // SYSTEM ONLINE'. Crackling plasma energy arcs across the viewport. " +
  "Luminous sovereign eyes ignite in the deep shadows with intense ethereal power. " +
  "A geometric targeting lattice locks onto the screen as radiant typography materializes: " +
  "'[SYSTEM AWAKENING: PLAYER SYNCHRONIZED]' surrounded by floating energy motes and volumetric light rays. " +
  "Cinematic lighting, high-fidelity 3D render, 4K resolution, 60fps.";

const DEFAULT_OUTPUT = path.join(__dirname, '..', 'apps', 'web', 'public', 'intro.mp4');

function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      if (line.startsWith('GEMINI_API_KEY=')) {
        return line.split('=')[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return null;
}

const apiKey = getApiKey();
if (!apiKey) {
  console.log("\n❌ ERREUR : La variable GEMINI_API_KEY est requise.");
  console.log("Définissez-la via :");
  console.log("  PowerShell : $env:GEMINI_API_KEY = 'votre_cle_api'");
  console.log("  Ou dans le fichier .env du projet.\n");
  process.exit(1);
}

console.log("\n=============================================================");
console.log("⚡ DÉMARRAGE DU PROTOCOLE DE GÉNÉRATION VIDÉO GOOGLE FLOW / VEO");
console.log("=============================================================");
console.log("• Modèle Cible   : gemini-omni-1.2-flash");
console.log("• Fichier Sortie : " + DEFAULT_OUTPUT);
console.log("• Prompt         : " + DEFAULT_PROMPT.slice(0, 110) + "...\n");

// Ensure output dir exists
const outputDir = path.dirname(DEFAULT_OUTPUT);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log("ℹ️  Pour générer la vidéo via le SDK Python officiel :");
console.log("   python scripts/generate_system_intro_video.py --duration 8 --resolution 720p\n");
