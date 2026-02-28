@echo off
echo Creating required folders...

mkdir input 2>nul
mkdir output 2>nul

echo Folders ready.
echo Building Docker image...
docker compose build --no-cache
echo Build complete.
