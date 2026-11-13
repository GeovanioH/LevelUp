#!/usr/bin/env python3
"""
LevelUp System — Script de Génération de la Vidéo d'Introduction Cinématique (Google Flow / Veo / Gemini Omni Flash)

Ce script utilise l'API Google GenAI et le modèle de génération vidéo Gemini Omni 1.2 Flash (Veo / Google Flow)
pour créer une cinématique d'introduction au style Solo Leveling / Monarch System.
La vidéo générée est automatiquement enregistrée sous apps/web/public/intro.mp4 pour être jouée
comme splash screen cinématographique au chargement de l'application web.

Prérequis :
  pip install -U google-genai
  export GEMINI_API_KEY="votre_clé_api"  # (ou via .env)

Utilisation :
  python scripts/generate_system_intro_video.py
  python scripts/generate_system_intro_video.py --duration 10 --resolution 1080p
"""

import argparse
import os
import sys
import time

DEFAULT_PROMPT = (
    "Cinematic dark fantasy sci-fi RPG opening sequence. "
    "In an obsidian cosmic void, swirling bioluminescent violet and electric cyan energy vortexes converge. "
    "An ancient, radiant holographic HUD interface ignites with glowing futuristic runes, "
    "displaying 'LEVELUP // SYSTEM ONLINE'. Crackling plasma energy arcs across the viewport. "
    "Luminous sovereign eyes ignite in the deep shadows with intense ethereal power. "
    "A geometric targeting lattice locks onto the screen as radiant typography materializes: "
    "'[SYSTEM AWAKENING: PLAYER SYNCHRONIZED]' surrounded by floating energy motes and volumetric light rays. "
    "Cinematic lighting, high-fidelity 3D render, 4K resolution, 60fps."
)

DEFAULT_OUTPUT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "apps", "web", "public", "intro.mp4"
)

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY")
    if not key and os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY="):
                    key = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break
    return key

def main():
    parser = argparse.ArgumentParser(description="Générateur de Vidéo d'Intro Système LevelUp via Google Flow (Gemini Omni Flash / Veo)")
    parser.add_argument("--prompt", type=str, default=DEFAULT_PROMPT, help="Prompt textuel de génération vidéo")
    parser.add_argument("--duration", type=int, default=8, help="Durée de la vidéo en secondes (3 à 15, défaut: 8)")
    parser.add_argument("--resolution", type=str, default="720p", choices=["360p", "720p", "1080p", "4k"], help="Résolution de sortie (défaut: 720p)")
    parser.add_argument("--aspect-ratio", type=str, default="16:9", choices=["16:9", "9:16"], help="Ratio d'aspect (défaut: 16:9)")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT, help="Chemin du fichier vidéo de destination (défaut: apps/web/public/intro.mp4)")
    parser.add_argument("--model", type=str, default="gemini-omni-1.2-flash", help="Modèle vidéo Gemini (défaut: gemini-omni-1.2-flash)")
    args = parser.parse_args()

    api_key = get_api_key()
    if not api_key:
        print("\n❌ ERREUR : La clé d'API GEMINI_API_KEY est introuvable.")
        print("Veuillez définir votre clé d'API :")
        print("  Windows PowerShell : $env:GEMINI_API_KEY = 'votre_cle_api'")
        print("  Linux / macOS      : export GEMINI_API_KEY='votre_cle_api'")
        print("  Ou ajoutez GEMINI_API_KEY=votre_cle dans le fichier .env\n")
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("\n❌ ERREUR : Le package 'google-genai' n'est pas installé.")
        print("Installez-le avec la commande suivante :")
        print("  pip install -U google-genai\n")
        sys.exit(1)

    print("\n" + "=" * 65)
    print("⚡ PROTOCOLE DE GÉNÉRATION VIDÉO SOUVERAINE // GOOGLE FLOW ENGINE")
    print("=" * 65)
    print(f"• Modèle          : {args.model}")
    print(f"• Durée           : {args.duration}s")
    print(f"• Résolution      : {args.resolution}")
    print(f"• Ratio           : {args.aspect_ratio}")
    print(f"• Fichier Cible   : {args.output}")
    print(f"• Prompt Synthèse : {args.prompt[:100]}...\n")

    client = genai.Client(api_key=api_key)

    video_config = {
        "type": "video",
        "delivery": "uri",
        "aspect_ratio": args.aspect_ratio,
        "duration": f"{args.duration}s",
        "resolution": args.resolution
    }

    input_parts = [
        {"type": "text", "text": args.prompt}
    ]

    print("🚀 Envoi de la requête de génération au réseau neuronal Google...")
    start_time = time.time()
    try:
        interaction = client.interactions.create(
            model=args.model,
            input=input_parts,
            response_format=video_config
        )
    except Exception as e:
        print(f"\n❌ Erreur lors de l'appel à l'API Interactions : {e}")
        sys.exit(1)

    elapsed = time.time() - start_time
    print(f"✓ Synthèse vidéo réussie en {elapsed:.1f} secondes!")

    output_video = interaction.output_video
    if not output_video or not output_video.uri:
        print("\n❌ Aucun contenu vidéo reçu dans la réponse du modèle.")
        sys.exit(1)

    print(f"• URI de téléchargement : {output_video.uri}")
    print(f"📥 Téléchargement vers {args.output}...")

    # Assurer que le répertoire parent existe
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    try:
        video_bytes = client.files.download(file=output_video.uri)
        with open(args.output, "wb") as f:
            f.write(video_bytes)
        file_size_mb = os.path.getsize(args.output) / (1024 * 1024)
        print(f"\n🎉 SUCCÈS ! La vidéo cinématique a été enregistrée avec succès ({file_size_mb:.2f} Mo).")
        print(f"Emplacement : {args.output}")
        print("La vidéo sera jouée automatiquement comme écran de chargement (splash screen) au démarrage du Système LevelUp!\n")
    except Exception as e:
        print(f"\n❌ Erreur lors du téléchargement du fichier vidéo : {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
