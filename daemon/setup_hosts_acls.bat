@echo off
rem ============================================================================
rem LevelUp - Configuration des Listes de Controle d'Acces (ACLs) du Fichier Hosts
rem Verrouille l'acces en ecriture au fichier hosts aux seuls administrateurs
rem Reference: docs/08-IMPLEMENTATION_PLAN.md Tache 6.1
rem ============================================================================

set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts

echo [LEVELUP] Configuration des autorisations de securite sur %HOSTS_FILE%...
icacls "%HOSTS_FILE%" /grant:r *S-1-5-32-544:(F) /inheritance:r
if %ERRORLEVEL% equ 0 (
    echo [SUCCES] Permissions ACLs appliquees avec succes.
) else (
    echo [ATTENTION] Execution necessitant des privileges administrateur eleves.
)
exit /b 0
