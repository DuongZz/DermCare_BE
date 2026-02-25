@echo off
echo =============================================
echo   Generating self-signed SSL certificate
echo   for localhost development
echo =============================================
echo.

mkdir "%~dp0ssl" 2>nul

openssl req -x509 -nodes -days 365 -newkey rsa:2048 ^
  -keyout "%~dp0ssl\localhost.key" ^
  -out "%~dp0ssl\localhost.crt" ^
  -subj "/C=VN/ST=Hanoi/L=Hanoi/O=DermCare/CN=localhost" ^
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo.
echo Done! Files created:
echo   - nginx\ssl\localhost.crt
echo   - nginx\ssl\localhost.key
echo.
pause
