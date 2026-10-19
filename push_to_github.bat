@echo off
echo ==============================================================================
echo   Pushing JANMITRA to https://github.com/FaizanRayeen/JANMITRA
echo ==============================================================================
cd /d "C:\Users\Asus\Downloads\JANMITRA"
git branch -M main
git push -u origin main
echo.
if %errorlevel% neq 0 (
    echo [ERROR] Push failed. If the repository does not exist yet on GitHub,
    echo         please create an empty repository named 'JANMITRA' at:
    echo         https://github.com/new
) else (
    echo [SUCCESS] JANMITRA successfully pushed to https://github.com/FaizanRayeen/JANMITRA !
)
echo.
pause
