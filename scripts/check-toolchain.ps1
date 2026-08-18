[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = Split-Path -Parent $PSScriptRoot
$expectedNode = (Get-Content (Join-Path $repositoryRoot '.nvmrc') -Raw).Trim().TrimStart('v')
$package = Get-Content (Join-Path $repositoryRoot 'package.json') -Raw | ConvertFrom-Json
$expectedNpm = ($package.packageManager -replace '^npm@', '')

function Fail([string]$Message) {
    throw "[toolchain] $Message"
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail 'Node.js não encontrado. Instale a versão declarada em .nvmrc.'
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail 'npm não encontrado.'
}

$actualNode = (& node --version).Trim().TrimStart('v')
$actualNpm = (& npm --version).Trim()

if ($actualNode -ne $expectedNode) {
    Fail "Node.js $expectedNode é obrigatório; encontrado: $actualNode."
}
if ($actualNpm -ne $expectedNpm) {
    Fail "npm $expectedNpm é obrigatório; encontrado: $actualNpm."
}
if ($package.engines.node -ne $expectedNode) {
    Fail "package.json engines.node deve ser $expectedNode."
}
if ($package.engines.npm -ne $expectedNpm) {
    Fail "package.json engines.npm deve ser $expectedNpm."
}

Write-Host "[toolchain] OK - Node.js $actualNode e npm $actualNpm."
