@echo off
color 0A
cls
title Yestefir Kurulum Paneli

echo ======================================================
echo             YESTEFIR KURULUM PANELI
echo ======================================================
echo.

:: Kontrol ve hazirlik
echo Sistem kontrol ediliyor...
timeout /t 2 >nul

:: Node.js kontrolu
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js bulunamadi! Kurulum yapilabilmesi icin Node.js gereklidir.
    echo [i] Node.js'i indirmek icin: https://nodejs.org/
    echo.
    pause
    exit
)

echo [✓] Node.js bulundu.
echo [i] Kurulum hazirlaniyor...
timeout /t 1 >nul
echo.

:menu
cls
echo ======================================================
echo             YESTEFIR KURULUM PANELI
echo ======================================================
echo.
echo Lutfen yapmak istediginiz islemi secin:
echo.
echo [1] Temel kurulum (npm i)
echo [2] Temiz kurulum (node_modules silinir ve yeniden kurulur)
echo [3] Gelistirici kurulumu (gelistirme paketleri dahil)
echo [4] Cikis
echo.
set /p secim="Seciminiz (1-4): "

if "%secim%"=="1" goto temel_kurulum
if "%secim%"=="2" goto temiz_kurulum
if "%secim%"=="3" goto gelistirici_kurulum
if "%secim%"=="4" goto cikis
echo Gecersiz secim! Lutfen tekrar deneyin.
timeout /t 2 >nul
goto menu

:temel_kurulum
cls
echo ======================================================
echo             TEMEL KURULUM BASLATILIYOR
echo ======================================================
echo.
echo Paketler kuruluyor...
call npm i
if %errorlevel% neq 0 (
    echo.
    echo [!] Kurulum sirasinda bir hata olustu!
    echo.
    pause
    goto menu
)
echo.
echo [✓] Kurulum basariyla tamamlandi!
echo.
pause
goto menu

:temiz_kurulum
cls
echo ======================================================
echo             TEMIZ KURULUM BASLATILIYOR
echo ======================================================
echo.
echo Eski node_modules klasoru siliniyor...
if exist node_modules (
    rmdir /s /q node_modules
    echo [✓] node_modules klasoru silindi.
) else (
    echo [i] Silinecek node_modules klasoru bulunamadi.
)

if exist package-lock.json (
    del package-lock.json
    echo [✓] package-lock.json silindi.
)
echo.
echo Paketler yeniden kuruluyor...
call npm i
if %errorlevel% neq 0 (
    echo.
    echo [!] Kurulum sirasinda bir hata olustu!
    echo.
    pause
    goto menu
)
echo.
echo [✓] Temiz kurulum basariyla tamamlandi!
echo.
pause
goto menu

:gelistirici_kurulum
cls
echo ======================================================
echo          GELISTIRICI KURULUMU BASLATILIYOR
echo ======================================================
echo.
echo Gelistirme paketleri kuruluyor...
call npm i
echo.
echo Gelistirici paketleri ekleniyor...
call npm i --save-dev nodemon eslint prettier
if %errorlevel% neq 0 (
    echo.
    echo [!] Kurulum sirasinda bir hata olustu!
    echo.
    pause
    goto menu
)
echo.
echo [✓] Gelistirici kurulumu basariyla tamamlandi!
echo.
pause
goto menu

:cikis
cls
echo ======================================================
echo                YESTEFIR KURULUM PANELI
echo ======================================================
echo.
echo Kurulum panelinden cikiliyor...
echo Tesekkur ederiz!
echo.
timeout /t 3 >nul
exit