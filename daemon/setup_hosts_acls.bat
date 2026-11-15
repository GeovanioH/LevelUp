@echo off
rem ============================================================================
rem LevelUp - Configuration des Permissions du Fichier Hosts (Sentinelle Locale)
rem Autorise le Système LevelUp a appliquer et lever le blocage des distractions
rem ============================================================================

set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts

echo [LEVELUP] Configuration des autorisations de securite sur %HOSTS_FILE%...
icacls "%HOSTS_FILE%" /grant *S-1-5-32-545:(M) /grant *S-1-5-32-544:(F)
if %ERRORLEVEL% equ 0 (
    echo [SUCCES] Permissions ACLs appliquees avec succes. LevelUp peut gerer les redirections.
) else (
    echo [ATTENTION] Execution necessitant des privileges administrateur eleves.
)
exit /b 0
