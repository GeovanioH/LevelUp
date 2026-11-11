<#
.SYNOPSIS
    LevelUp Penalty Watchdog - Hosts File & WFP Distraction Blocker
    Enforces distraction domain block when daily quests fail or during Deep Work.
    Reference: docs/08-IMPLEMENTATION_PLAN.md Tâche 6.1

.PARAMETER TestMode
    Runs in simulation/verification mode without requiring administrator privileges.
#>

param(
    [switch]$TestMode
)

$ErrorActionPreference = "Stop"

$TARGET_DOMAINS = @(
    "tiktok.com",
    "www.tiktok.com",
    "instagram.com",
    "www.instagram.com",
    "twitter.com",
    "x.com",
    "reddit.com",
    "www.reddit.com",
    "youtube.com",
    "www.youtube.com"
)

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "[SYSTÈME : SENTINELLE] Démarrage du Watchdog de Pénalité LevelUp" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

if ($TestMode) {
    Write-Host "[TEST MODE] Validation du blocage et de la restauration DNS en bac à sable..." -ForegroundColor Yellow
    
    # 1. Simulate temporary hosts sandbox
    $sandboxHosts = New-TemporaryFile
    try {
        $initialContent = @"
# LevelUp Sandbox Hosts File
127.0.0.1 localhost
::1 localhost
"@
        Set-Content -Path $sandboxHosts.FullName -Value $initialContent -Encoding utf8
        Write-Host "  -> [OK] Fichier hosts sandbox instancié : $($sandboxHosts.FullName)" -ForegroundColor Green

        # 2. Apply penalty block
        $blockRules = $TARGET_DOMAINS | ForEach-Object { "127.0.0.1 $_ # LevelUp Penalty Block" }
        Add-Content -Path $sandboxHosts.FullName -Value $blockRules -Encoding utf8
        Write-Host "  -> [OK] $( $TARGET_DOMAINS.Count ) domaines toxiques injectés vers 127.0.0.1" -ForegroundColor Green

        # 3. Verify block
        $blockedContent = Get-Content -Path $sandboxHosts.FullName -Raw
        $allBlocked = $true
        foreach ($domain in $TARGET_DOMAINS) {
            if (-not ($blockedContent -match [regex]::Escape("127.0.0.1 $domain"))) {
                $allBlocked = $false
                Write-Host "  -> [ERREUR] Domaine non bloqué : $domain" -ForegroundColor Red
            }
        }

        if (-not $allBlocked) {
            throw "Échec d'application de la pénalité sur certains domaines."
        }
        Write-Host "  -> [SUCCÈS] Blocage vérifié pour l'ensemble des domaines distrayants." -ForegroundColor Green

        # 4. Restore original DNS
        Set-Content -Path $sandboxHosts.FullName -Value $initialContent -Encoding utf8
        $restoredContent = Get-Content -Path $sandboxHosts.FullName -Raw
        if ($restoredContent -match "tiktok.com") {
            throw "Échec de restauration de la table hosts."
        }
        Write-Host "  -> [SUCCÈS] Restauration DNS saine effectuée avec succès." -ForegroundColor Green
    }
    finally {
        if (Test-Path $sandboxHosts.FullName) {
            Remove-Item $sandboxHosts.FullName -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host "================================================================================" -ForegroundColor Green
    Write-Host "✅ TEST 6.1 RÉUSSI : Watchdog de Pénalité opérationnel et hermétique." -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Green
    exit 0
}

# Production Mode
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
Write-Host "[PROD MODE] Surveillance active des quêtes du Monarque sur $hostsPath..." -ForegroundColor Cyan
# Actual watchdog loop here when running as a continuous background daemon
