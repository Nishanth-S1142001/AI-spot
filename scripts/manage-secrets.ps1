# Secrets Management Helper Script

param(
    [Parameter(Position=0)]
    [ValidateSet('rotate-all', 'check', 'help')]
    [string]$Command = 'help'
)

function Show-Usage {
    Write-Host "Usage: .\manage-secrets.ps1 [command]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  rotate-all      Rotate all secrets"
    Write-Host "  check           Check for exposed secrets"
    Write-Host "  help            Show this help message"
    Write-Host ""
}

function Rotate-AllSecrets {
    Write-Host "Generating new secrets..." -ForegroundColor Yellow
    
    function Generate-Secret {
        $bytes = New-Object byte[] 32
        $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
        $rng.GetBytes($bytes)
        return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
    }
    
    Write-Host ""
    Write-Host "NEXTAUTH_SECRET=$(Generate-Secret)"
    Write-Host "ENCRYPTION_KEY=$(Generate-Secret)"
    Write-Host ""
    Write-Host "WARNING: Update these in your environment and rotate API keys manually" -ForegroundColor Red
}

function Check-Secrets {
    Write-Host "Checking for exposed secrets..." -ForegroundColor Yellow
    
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $patterns = @('sk-', 'AKIA', 'eyJhbG', '_key', '_secret', 'password')
        
        Write-Host "Searching git history for common secret patterns..."
        $foundSecrets = $false
        foreach ($pattern in $patterns) {
            $results = git log -p --all -S $pattern 2>$null
            if ($results) {
                Write-Host "[WARNING] Found potential secrets matching pattern: $pattern" -ForegroundColor Yellow
                $foundSecrets = $true
            }
        }
        
        if (-not $foundSecrets) {
            Write-Host "[OK] No obvious secrets found in recent history" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARNING] Git not found. Install Git to check for secrets." -ForegroundColor Red
    }
}

switch ($Command) {
    'rotate-all' { Rotate-AllSecrets }
    'check' { Check-Secrets }
    default { Show-Usage }
}
