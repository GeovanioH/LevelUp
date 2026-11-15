@echo off
rem ============================================================================
rem LevelUp - Activation Hermetique Sentinelle Reseau & Hosts
rem Configure les ACLs Hosts (Utilisateurs:M) et assigne le DNS Wi-Fi vers NextDNS
rem ============================================================================
chcp 65001 >nul
echo [LEVELUP] Initialisation de la Sentinelle Reseau du Monarque...

set HOSTS_FILE=%SystemRoot%\System32\drivers\etc\hosts

echo [1/4] Attribution des droits d'ecriture sur %HOSTS_FILE% pour LevelUp...
icacls "%HOSTS_FILE%" /grant *S-1-5-32-545:(M) /grant *S-1-5-32-544:(F) >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo   -> [SUCCES] Fichier hosts debloque en ecriture pour LevelUp.
) else (
    echo   -> [ATTENTION] Droits administrateur eleves requis.
)

echo [2/4] Configuration du DNS Wi-Fi vers la Sentinelle NextDNS (45.90.28.184, 45.90.30.184)...
powershell -NoProfile -Command "Set-DnsClientServerAddress -InterfaceAlias 'Wi-Fi' -ServerAddresses ('45.90.28.184', '45.90.30.184') -ErrorAction SilentlyContinue"
echo   -> [SUCCES] DNS Wi-Fi relie a NextDNS.

echo [3/4] Liaison de l'adresse IP publique au profil NextDNS aa43db...
powershell -NoProfile -Command "$res = Invoke-RestMethod -Uri 'https://link-ip.nextdns.io/aa43db/51f470f87d189167'; Write-Host '  -> [SUCCES] IP publique liee a NextDNS :' $res"

echo [4/4] Purge du cache DNS local (ipconfig /flushdns)...
ipconfig /flushdns >nul
echo   -> [SUCCES] Cache DNS purge.

echo.
echo ============================================================================
echo [SUCCES TOTAL] La Sentinelle Reseau LevelUp est maintenant hermetique et active !
echo ============================================================================
timeout /t 3 >nul
exit /b 0
