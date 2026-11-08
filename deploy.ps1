# CafeMind - Google Cloud Run Deployment Script
param (
    [string]$ProjectId = "",
    [string]$Region = "asia-south1",
    [string]$ServiceName = "cafemind",
    [string]$CloudSqlInstance = "" # e.g. "my-project:asia-south1:cafemind-postgres"
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   CafeMind Google Cloud Run Deployment      " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Verify gcloud
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "Google Cloud SDK ('gcloud') is not found in PATH. Please install it from https://cloud.google.com/sdk"
    exit 1
}

# 2. Project ID resolution
if (-not $ProjectId) {
    $ProjectId = gcloud config get-value project 2>$null
    if (-not $ProjectId) {
        Write-Error "GCP Project ID is required. Pass -ProjectId <id> or run 'gcloud config set project <id>'."
        exit 1
    }
}

Write-Host "[1/4] Target Project: $ProjectId | Region: $Region" -ForegroundColor Green

# 3. Build & Submit to Google Cloud Build
$ImageTag = "asia-south1-docker.pkg.dev/$ProjectId/cafemind-repo/${ServiceName}:latest"
Write-Host "[2/4] Submitting build to Google Cloud Build: $ImageTag ..." -ForegroundColor Yellow
gcloud builds submit --tag $ImageTag .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Cloud Build failed."
    exit $LASTEXITCODE
}

# 4. Deploy to Cloud Run
Write-Host "[3/4] Deploying to Google Cloud Run: $ServiceName ..." -ForegroundColor Yellow

$DeployArgs = @(
    "run", "deploy", $ServiceName,
    "--image", $ImageTag,
    "--platform", "managed",
    "--region", $Region,
    "--allow-unauthenticated",
    "--port", "8080",
    "--memory", "1Gi",
    "--cpu", "1",
    "--min-instances", "0",
    "--max-instances", "3"
)

if ($CloudSqlInstance) {
    Write-Host "Attaching Google Cloud SQL Instance: $CloudSqlInstance" -ForegroundColor Cyan
    $DeployArgs += "--add-cloudsql-instances"
    $DeployArgs += $CloudSqlInstance
}

& gcloud @DeployArgs

if ($LASTEXITCODE -eq 0) {
    $ServiceUrl = gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)'
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host " DEPLOYMENT SUCCESSFUL!                      " -ForegroundColor Green
    Write-Host " Service URL: $ServiceUrl                    " -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Green
} else {
    Write-Error "Cloud Run deployment failed."
    exit $LASTEXITCODE
}
