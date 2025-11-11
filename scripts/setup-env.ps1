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
