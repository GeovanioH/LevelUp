@echo off
rem ============================================================================
rem LevelUp - Deploiement des Services Systemes Windows (NSSM)
rem Reference: docs/08-IMPLEMENTATION_PLAN.md Tache 6.3
rem ============================================================================

echo [LEVELUP] Verification de l'environnement de production...
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Docker n'est pas installe ou n'est pas present dans le PATH.
    exit /b 1
)

echo [LEVELUP] Lancement des conteneurs de production avec docker-compose.prod.yml...
docker compose -f docker-compose.prod.yml up -d --build
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Echec lors du lancement des conteneurs de production.
    exit /b %ERRORLEVEL%
)

echo [SUCCES] L'infrastructure de production LevelUp est active et securisee.
exit /b 0
