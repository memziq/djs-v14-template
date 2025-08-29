@echo off
title BOT
cd /d "%~dp0"

:loop
echo [%date% %time%] Slash komutlari deploy ediliyor...
node index.js
if %errorlevel% neq 0 (
    color 0C
    echo [%date% %time%] Bot hata ile kapandi. Yeniden baslatiliyor...
) else (
    color 0A
    echo [%date% %time%] Bot duzgun kapandi. Yeniden baslatiliyor...
)
timeout /t 3 >nul
goto loop
