# Day 1 Emergency Security Fixes - Windows Version
# RUN THIS IMMEDIATELY IN POWERSHELL

#Requires -Version 5.0

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AI Agent Platform - Day 1 Security Fixes" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "WARNING: This script will help you secure your production environment" -ForegroundColor Red
Write-Host ""
Write-Host "Before running this script, ensure you have:" -ForegroundColor Yellow
Write-Host "1. Backup of your current .env file"
Write-Host "2. Access to all third-party services (OpenAI, Supabase, etc.)"
Write-Host "3. Git installed and configured"
Write-Host "4. PowerShell running as Administrator (for some operations)"
Write-Host ""
$continue = Read-Host "Press ENTER to continue or Ctrl+C to abort"

# Step 1: Create backup
Write-Host ""
Write-Host "Step 1: Creating backup of existing .env files" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup.$timestamp"
    Write-Host "[OK] Backup created: .env.backup.$timestamp" -ForegroundColor Green
}

if (Test-Path ".env.local") {
    Copy-Item ".env.local" ".env.local.backup.$timestamp"
    Write-Host "[OK] Backup created: .env.local.backup.$timestamp" -ForegroundColor Green
}

# Step 2: Generate new secrets
Write-Host ""
Write-Host "Step 2: Generating new secrets" -ForegroundColor Yellow

function Generate-Secret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    $rng.GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

$NEXTAUTH_SECRET = Generate-Secret
$ENCRYPTION_KEY = Generate-Secret

Write-Host "[OK] Generated new NEXTAUTH_SECRET" -ForegroundColor Green
Write-Host "[OK] Generated new ENCRYPTION_KEY" -ForegroundColor Green

# Step 3: Create new .env.example template
Write-Host ""
Write-Host "Step 3: Creating .env.example template" -ForegroundColor Yellow

$envExampleContent = @"
# Database Configuration
SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Authentication
NEXTAUTH_SECRET=generate_with_powershell_script
NEXTAUTH_URL=http://localhost:3000

# API Keys (NEVER commit actual keys)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Encryption
ENCRYPTION_KEY=generate_with_powershell_script

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development

# Email Configuration
FEEDBACK_EMAIL_USER=your_email_here
FEEDBACK_EMAIL_PASS=your_app_password_here

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=agent-files

# Rate Limiting
CHAT_RATE_LIMIT=20

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
DATADOG_API_KEY=your_datadog_key_here

# Redis (Optional)
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# External Integrations (Optional)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
STRIPE_SECRET_KEY=your_key
SENDGRID_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
"@

Set-Content -Path ".env.example" -Value $envExampleContent -Encoding UTF8
Write-Host "[OK] Created .env.example template" -ForegroundColor Green

# Step 4: Create/Update .gitignore
Write-Host ""
Write-Host "Step 4: Securing .gitignore" -ForegroundColor Yellow

if (-not (Test-Path ".gitignore")) {
    New-Item ".gitignore" -ItemType File | Out-Null
}

$gitignoreAdditions = @"

# Environment files
.env
.env.local
.env*.local
.env.production
.env.development
.env.backup.*

# Secrets
secrets/
*.pem
*.key
*.cert

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# Temporary files
tmp/
temp/

# Windows specific
Thumbs.db
Desktop.ini
"@

Add-Content -Path ".gitignore" -Value $gitignoreAdditions -Encoding UTF8
Write-Host "[OK] Updated .gitignore" -ForegroundColor Green

# Step 5: Check for Git
Write-Host ""
Write-Host "Step 5: Checking Git installation" -ForegroundColor Yellow

if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Git is installed" -ForegroundColor Green
    $gitInstalled = $true
} else {
    Write-Host "[WARNING] Git not found. Please install Git for Windows:" -ForegroundColor Yellow
    Write-Host "   Visit: https://git-scm.com/download/win"
    $gitInstalled = $false
}

# Step 6: Create pre-commit hook
Write-Host ""
Write-Host "Step 6: Creating pre-commit hook" -ForegroundColor Yellow

if ($gitInstalled -and (Test-Path ".git")) {
    $gitHooksDir = ".git\hooks"
    if (-not (Test-Path $gitHooksDir)) {
        New-Item -ItemType Directory -Path $gitHooksDir | Out-Null
    }

    $preCommitHook = @'
#!/bin/sh

# Check for .env files
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$|\.env\.production$"; then
    echo "ERROR: Attempting to commit .env file!"
    echo "Please remove .env files from your commit."
    exit 1
fi

# Check for common secret patterns
if git diff --cached | grep -E "(PRIVATE_KEY|SECRET_KEY|PASSWORD|API_KEY|TOKEN)" | grep -v "your_.*_here" | grep -v "\.example"; then
    echo "WARNING: Potential secrets detected in commit!"
    echo "Please review your changes carefully."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

exit 0
'@

    $preCommitPath = Join-Path $gitHooksDir "pre-commit"
    Set-Content -Path $preCommitPath -Value $preCommitHook -Encoding UTF8
    Write-Host "[OK] Created pre-commit hook" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Skipping pre-commit hook (Git not found or not a git repository)" -ForegroundColor Yellow
}

# Step 7: Create scripts directory and helper scripts
Write-Host ""
Write-Host "Step 7: Creating helper scripts" -ForegroundColor Yellow

if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" | Out-Null
}

# Create manage-secrets.ps1
$manageSecretsScript = @'
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
'@

Set-Content -Path "scripts\manage-secrets.ps1" -Value $manageSecretsScript -Encoding UTF8
Write-Host "[OK] Created scripts\manage-secrets.ps1" -ForegroundColor Green

# Create setup-env.ps1
$setupEnvScript = @'
# Environment Setup Script

Write-Host "Setting up environment..." -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "[OK] Created .env.local from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env.local and add your actual credentials" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "[WARNING] .env.local already exists. Skipping..." -ForegroundColor Yellow
}

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your credentials"
Write-Host "2. Run 'npm install' to install dependencies"
Write-Host "3. Run 'npm run dev' to start development server"
Write-Host ""
Write-Host "Security checklist:" -ForegroundColor Yellow
Write-Host "- [ ] All API keys updated in .env.local"
Write-Host "- [ ] .env.local added to .gitignore"
Write-Host "- [ ] Pre-commit hooks working"
Write-Host "- [ ] Git configured properly"
'@

Set-Content -Path "scripts\setup-env.ps1" -Value $setupEnvScript -Encoding UTF8
Write-Host "[OK] Created scripts\setup-env.ps1" -ForegroundColor Green

# Step 8: Check git history for secrets
Write-Host ""
Write-Host "Step 8: Checking git history for secrets" -ForegroundColor Yellow

if ($gitInstalled -and (Test-Path ".git")) {
    $response = Read-Host "Scan git history? This may take time. (y/N)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Scanning for common secret patterns..." -ForegroundColor Cyan
        
        $secretsFound = $false
        $patterns = @('sk-proj-', 'sk-test-', 'AKIA', 'eyJhbG')
        
        foreach ($pattern in $patterns) {
            $results = git log -p --all -S $pattern 2>$null
            if ($results) {
                Write-Host "[WARNING] Found potential secrets matching: $pattern" -ForegroundColor Red
                $secretsFound = $true
            }
        }
        
        if ($secretsFound) {
            Write-Host ""
            Write-Host "CRITICAL: Secrets found in git history!" -ForegroundColor Red
            Write-Host ""
            Write-Host "To clean git history, you can use BFG Repo-Cleaner:" -ForegroundColor Yellow
            Write-Host "1. Download from: https://rtyley.github.io/bfg-repo-cleaner/"
            Write-Host "2. Run: java -jar bfg.jar --delete-files .env"
            Write-Host "3. Run: git reflog expire --expire=now --all"
            Write-Host "4. Run: git gc --prune=now --aggressive"
            Write-Host ""
            Write-Host "WARNING: This rewrites history. Coordinate with your team!" -ForegroundColor Red
        } else {
            Write-Host "[OK] No obvious secrets found in recent history" -ForegroundColor Green
        }
    }
} else {
    Write-Host "[WARNING] Not a git repository. Skipping history scan." -ForegroundColor Yellow
}

# Step 9: Create secrets file
Write-Host ""
Write-Host "Step 9: Saving generated secrets" -ForegroundColor Yellow

$secretsContent = @"
# Generated Secrets - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# WARNING: SAVE THESE SECURELY AND DELETE THIS FILE

NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Next steps:
# 1. Copy these to your .env.local file
# 2. Store in your password manager (1Password, Bitwarden, etc.)
# 3. Delete this file: Remove-Item .secrets.tmp
"@

Set-Content -Path ".secrets.tmp" -Value $secretsContent -Encoding UTF8
Write-Host "[OK] Generated secrets saved to: .secrets.tmp" -ForegroundColor Green

# Final summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "[OK] Backed up existing .env files" -ForegroundColor Green
Write-Host "[OK] Generated new secrets" -ForegroundColor Green
Write-Host "[OK] Created .env.example template" -ForegroundColor Green
Write-Host "[OK] Updated .gitignore" -ForegroundColor Green
Write-Host "[OK] Created pre-commit hook" -ForegroundColor Green
Write-Host "[OK] Created helper scripts" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. IMMEDIATE:" -ForegroundColor Red
Write-Host "   - Open .secrets.tmp and copy secrets to password manager"
Write-Host "   - Run: Copy-Item .env.example .env.local"
Write-Host "   - Edit .env.local with all your credentials"
Write-Host "   - Rotate all API keys in third-party services"
Write-Host "   - Delete .secrets.tmp: Remove-Item .secrets.tmp"
Write-Host ""
Write-Host "2. CRITICAL:" -ForegroundColor Red
Write-Host "   - Review and clean git history if secrets were found"
Write-Host "   - Set up AWS Secrets Manager or Azure Key Vault"
Write-Host "   - Enable Supabase Row Level Security"
Write-Host ""
Write-Host "3. IMPORTANT:" -ForegroundColor Yellow
Write-Host "   - Run 'npm install' to install dependencies"
Write-Host "   - Review PRODUCTION_READINESS_MANUAL.md"
Write-Host "   - Follow Week 1 security checklist"
Write-Host ""
Write-Host "WARNING: DO NOT commit any .env files to git!" -ForegroundColor Red
Write-Host ""
Write-Host "Generated secrets saved to: .secrets.tmp" -ForegroundColor Cyan
Write-Host "Copy these to your password manager, then delete the file!" -ForegroundColor Yellow
Write-Host ""
Write-Host "To set up environment: .\scripts\setup-env.ps1" -ForegroundColor Cyan
Write-Host "To manage secrets: .\scripts\manage-secrets.ps1 help" -ForegroundColor Cyan
Write-Host ""