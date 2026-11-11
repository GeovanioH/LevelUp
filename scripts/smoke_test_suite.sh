#!/usr/bin/env bash
# ==============================================================================
# LevelUp ("The System") - Sovereign End-to-End Smoke Test Suite
# Validates the complete 24h cycle of the Monarch Huriel
# Reference: docs/09-ROADMAP.md Section 21.8
# ==============================================================================

set -euo pipefail

echo "================================================================================"
echo "[SYSTÈME : SMOKE TEST] Démarrage du Test Global End-to-End du Système LevelUp"
echo "================================================================================"

# 1. Vérification de l'intégrité documentaire
echo "[ÉTAPE 1/4] Audit d'intégrité de la documentation..."
pnpm tsx scripts/verify_doc_sizes.ts

# 2. Validation du scénario E2E complet
echo "[ÉTAPE 2/4] Exécution du scénario E2E de vie réelle..."
pnpm test tests/e2e/fullDaySoloLevelingScenario.spec.ts

# 3. Validation de l'audit cryptographique Merkle
echo "[ÉTAPE 3/4] Contrôle de l'arbre de Merkle et de la chaîne d'intégrité..."
pnpm test tests/unit/security/merkle.spec.ts

# 4. Télémétrie de la sentinelle matérielle
echo "[ÉTAPE 4/4] Inspection de la sentinelle GPU..."
python services/sentinel/gpuMonitor.py

echo "================================================================================"
echo "✅ CERTIFICATION MAÎTRE VALIDÉE : Le Système est opérationnel pour le Monarque."
echo "================================================================================"
