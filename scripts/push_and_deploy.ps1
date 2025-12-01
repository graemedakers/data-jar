# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Error "Git is not initialized in this directory."
    exit 1
}

# 1. Generate Database Migration
# This creates the SQL file for the changes we made (e.g., adding isPremium to Couple)
Write-Host "Step 1: Generating Database Migration..." -ForegroundColor Cyan
try {
    # We use 'migrate dev' to create the migration file and apply it locally
    # If this fails, it might be because the local DB isn't running.
    npx prisma migrate dev --name add_premium_features
}
catch {
    Write-Warning "Migration generation failed. Make sure your local database is running."
    $continue = Read-Host "Do you want to continue pushing code anyway? (y/n)"
    if ($continue -ne 'y') { exit }
}

# 2. Push Code to GitHub
Write-Host "`nStep 2: Pushing Code to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "Implement premium features, payment gating, and Stripe integration"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Code successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "If you have Vercel/Netlify connected, a new deployment should start automatically." -ForegroundColor Gray
} else {
    Write-Error "Failed to push to GitHub. Please check your remote configuration."
    exit 1
}

# 3. Apply Migrations to Production
Write-Host "`nStep 3: Deploying Database Changes to Production" -ForegroundColor Cyan
Write-Host "Your code changes are deployed, but your Production Database needs to be updated with the new schema." -ForegroundColor Yellow

$doMigrate = Read-Host "Do you want to run the production migration now? [y/N]"

if ($doMigrate -eq 'y') {
    $prodDbUrl = Read-Host "Enter your Production DATABASE_URL (e.g. postgres://...)"
    
    if (-not [string]::IsNullOrWhiteSpace($prodDbUrl)) {
        # Temporarily set the env var for this command only
        $env:DATABASE_URL = $prodDbUrl
        
        Write-Host "Applying migration to production..."
        npx prisma migrate deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Production database successfully migrated!" -ForegroundColor Green
        } else {
            Write-Error "Migration failed. Check your connection string."
        }
        
        # Clear the var just in case
        $env:DATABASE_URL = ""
    } else {
        Write-Warning "No URL provided. Skipping migration."
    }
} else {
    Write-Host "Skipping production migration."
    Write-Host "REMINDER: You must run 'npx prisma migrate deploy' against your production database for the app to work correctly." -ForegroundColor Magenta
}

Write-Host "`nDone!" -ForegroundColor Cyan
