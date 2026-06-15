# Staging down, production bridge connect, prod stack up on :3080/:8000.
$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")

function Invoke-Docker {
    param(
        [string[]]$DockerArgs,
        [string[]]$IgnorePatterns = @()
    )
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = & docker @DockerArgs 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    $text = ($output | Out-String).Trim()
    foreach ($pat in $IgnorePatterns) {
        if ($text -match $pat) { return @{ Code = 0; Output = $text } }
    }
    if ($code -ne 0) {
        throw "docker $($Args -join ' ') exited $code`n$text"
    }
    return @{ Code = $code; Output = $text }
}

Write-Host "[remobilize] staging compose down (releases :3080 and :8000)"
Push-Location $RepoRoot
try {
    docker compose -f deploy/docker-compose.staging.yml down
    if ($LASTEXITCODE -ne 0) { throw "staging down exited $LASTEXITCODE" }

    Write-Host "[remobilize] production bridge network"
    Invoke-Docker @("network", "create", "metis-production-bridge") -IgnorePatterns @(
        "already exists"
    ) | Out-Null

    $apiExists = (Invoke-Docker @(
        "ps", "-a", "--filter", 'name=^metis-production-api$', "--format", "{{.Names}}"
    )).Output
    if ($apiExists -match "metis-production-api") {
        $apiInspect = (Invoke-Docker @(
            "inspect", "metis-production-api", "--format", "{{.State.Running}}"
        )).Output
        Invoke-Docker @(
            "network", "connect", "metis-production-bridge", "metis-production-api"
        ) -IgnorePatterns @("already exists") | Out-Null
        if ($apiInspect -ne "true") {
            Write-Host "[remobilize] metis-production-api was stopped; starting container"
            Invoke-Docker @("start", "metis-production-api") | Out-Null
        }
    } else {
        Write-Host "[remobilize] metis-production-api container absent; prod web only"
    }

    $envFile = Join-Path $PSScriptRoot ".env.production"
    if (-not (Test-Path $envFile)) {
        @"
METIS_ENV=production
HOST_PORT=3080
INTERNAL_API_URL=http://metis-production-api:8000
"@ | Set-Content -Path $envFile -Encoding utf8
        Write-Host "[remobilize] .env.production was materialized from defaults"
    }

    Write-Host "[remobilize] production compose up"
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    docker compose -f deploy/production/docker-compose.prod.yml --env-file $envFile up -d
    $composeCode = $LASTEXITCODE
    $ErrorActionPreference = $prev
    if ($composeCode -ne 0) { throw "prod compose up exited $composeCode" }

    $deadline = (Get-Date).AddMinutes(3)
    $apiHealthy = $false
    $webUp = $false
    while ((Get-Date) -lt $deadline) {
        $ps = docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}"
        foreach ($line in $ps) {
            if ($line -match "^metis-production-api\|") {
                if ($line -match "healthy") { $apiHealthy = $true }
            }
            if ($line -match "^web-frontend-node-prod\|") {
                if ($line -match "Up" -and $line -match "3080") { $webUp = $true }
            }
        }
        if ($apiHealthy -and $webUp) { break }
        Start-Sleep -Seconds 3
    }

    Write-Host "[remobilize] docker ps snapshot:"
    docker ps --filter "name=metis-production-api" --filter "name=web-frontend-node-prod"

    if (-not $webUp) {
        throw "web-frontend-node-prod was not Up on :3080 before deadline"
    }
    if (-not $apiHealthy) {
        Write-Host "[remobilize] metis-production-api health not confirmed; web bound to :3080"
    }

    Write-Host "[remobilize] completed"
} finally {
    Pop-Location
}
