#!/usr/bin/env pwsh
# Deploy built app to GitHub Pages (gh-pages branch)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

npm run build

$PagesDir = Join-Path $Root "_pages"
if (Test-Path $PagesDir) { Remove-Item -Recurse -Force $PagesDir }
New-Item -ItemType Directory -Path $PagesDir | Out-Null
Copy-Item -Path (Join-Path $Root "dist\*") -Destination $PagesDir -Recurse -Force

Set-Location $PagesDir
if (-not (Test-Path .git)) {
  git init -b gh-pages
  git remote add origin https://github.com/m11nic89co/mindshtorm.git
}

git add -A
git commit -m "Deploy GitHub Pages" --allow-empty
if ($LASTEXITCODE -ne 0) {
  git commit -m "Deploy GitHub Pages"
}
git push -f origin gh-pages

Write-Host "Deployed: https://m11nic89co.github.io/mindshtorm/"
