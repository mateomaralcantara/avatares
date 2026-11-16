#Requires -Version 5.1

<#
.SYNOPSIS
    Ejecuta el escáner profesional de calidad del proyecto.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\quality-scan.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\quality-scan.ps1 -MinimumScore 9

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\quality-scan.ps1 -SkipTests
#>

[CmdletBinding()]
param(
    [ValidateRange(0, 10)]
    [double]$MinimumScore = 8,

    [switch]$SkipBuild,

    [switch]$SkipTests,

    [switch]$SkipAudit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

$scannerPath = [System.IO.Path]::Combine(
    $projectPath,
    "scripts",
    "quality-scan.mjs"
)

if (![System.IO.File]::Exists($scannerPath)) {
    Write-Host ""
    Write-Host "ERROR: No se encontró el escáner:" -ForegroundColor Red
    Write-Host $scannerPath -ForegroundColor Yellow
    exit 2
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if ($null -eq $nodeCommand) {
    Write-Host ""
    Write-Host "ERROR: Node.js no está disponible." -ForegroundColor Red
    Write-Host "Instala o agrega Node.js al PATH." -ForegroundColor Yellow
    exit 2
}

Set-Location -LiteralPath $projectPath

$scannerArguments = @(
    "--minimum=$MinimumScore"
)

if ($SkipBuild) {
    $scannerArguments += "--skip-build"
}

if ($SkipTests) {
    $scannerArguments += "--skip-tests"
}

if ($SkipAudit) {
    $scannerArguments += "--skip-audit"
}

Write-Host ""
Write-Host "Ejecutando escáner profesional..." -ForegroundColor Cyan
Write-Host "Proyecto: $projectPath" -ForegroundColor Yellow
Write-Host ""

& node $scannerPath @scannerArguments

exit $LASTEXITCODE