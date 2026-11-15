@echo off
rem ============================================================================
rem LevelUp - Restauration DNS Normal (Google DNS / DHCP)
rem ============================================================================
chcp 65001 >nul
echo [LEVELUP] Restauration de la configuration reseau par defaut...

powershell -NoProfile -Command "Set-DnsClientServerAddress -InterfaceAlias 'Wi-Fi' -ServerAddresses ('8.8.8.8', '8.8.4.4') -ErrorAction SilentlyContinue"
ipconfig /flushdns >nul
echo [SUCCES] DNS Wi-Fi retabli (Google DNS 8.8.8.8).
timeout /t 2 >nul
exit /b 0
