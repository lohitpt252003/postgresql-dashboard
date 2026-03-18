param(
    [switch]$Watch,
    [int]$DebounceSeconds = 2
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pathsToWatch = @(
    (Join-Path $root "backend"),
    (Join-Path $root "frontend"),
    (Join-Path $root "docker-compose.yml")
)

function Invoke-Refresh {
    Write-Host ""
    Write-Host "Rebuilding and restarting Docker services..." -ForegroundColor Cyan
    docker-compose up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "docker-compose up -d --build failed."
    }

    Write-Host "Refresh complete." -ForegroundColor Green
}

if (-not $Watch) {
    Invoke-Refresh
    exit 0
}

$watchers = @()
$state = [pscustomobject]@{
    Pending = $false
    LastEvent = Get-Date
}

function Register-Watcher {
    param(
        [string]$Path
    )

    if (-not (Test-Path $Path)) {
        return
    }

    $item = Get-Item $Path
    if ($item.PSIsContainer) {
        $watcher = New-Object System.IO.FileSystemWatcher
        $watcher.Path = $Path
        $watcher.Filter = "*"
        $watcher.IncludeSubdirectories = $true
    } else {
        $watcher = New-Object System.IO.FileSystemWatcher
        $watcher.Path = $item.DirectoryName
        $watcher.Filter = $item.Name
        $watcher.IncludeSubdirectories = $false
    }

    $watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'
    $watcher.EnableRaisingEvents = $true

    $action = {
        $state.Pending = $true
        $state.LastEvent = Get-Date
    }

    Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $action | Out-Null
    Register-ObjectEvent -InputObject $watcher -EventName Created -Action $action | Out-Null
    Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $action | Out-Null
    Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $action | Out-Null

    $script:watchers += $watcher
}

foreach ($path in $pathsToWatch) {
    Register-Watcher -Path $path
}

Write-Host "Watching for file changes. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host "Debounce: $DebounceSeconds second(s)" -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep -Seconds 1

        if (-not $state.Pending) {
            continue
        }

        $elapsed = (Get-Date) - $state.LastEvent
        if ($elapsed.TotalSeconds -lt $DebounceSeconds) {
            continue
        }

        $state.Pending = $false
        Invoke-Refresh
    }
}
finally {
    foreach ($watcher in $watchers) {
        $watcher.EnableRaisingEvents = $false
        $watcher.Dispose()
    }

    Get-EventSubscriber | Where-Object {
        $_.SourceObject -is [System.IO.FileSystemWatcher]
    } | Unregister-Event
}
