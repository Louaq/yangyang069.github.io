@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    网站地图生成器 - Windows版本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Python，请先安装Python 3.6+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python已安装
echo.

REM 检查并安装依赖
echo 🔍 检查依赖包...
python -c "import bs4" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 安装BeautifulSoup4...
    pip install beautifulsoup4
    if %errorlevel% neq 0 (
        echo ❌ 安装BeautifulSoup4失败
        pause
        exit /b 1
    )
)

echo ✅ 依赖包检查完成
echo.

REM 检查HTML文件是否存在
if not exist "index.html" (
    echo ❌ 错误: 未找到index.html文件
    echo 请确保在包含index.html的目录中运行此脚本
    pause
    exit /b 1
)

echo ✅ 找到index.html文件
echo.

REM 运行sitemap生成器
echo 🚀 开始生成网站地图...
echo.

if exist "auto_sitemap.py" (
    python auto_sitemap.py
) else if exist "generate_sitemap.py" (
    python generate_sitemap.py
) else (
    echo ❌ 错误: 未找到sitemap生成脚本
    echo 请确保generate_sitemap.py或auto_sitemap.py文件存在
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 网站地图生成完成！
echo.
echo 生成的文件:
if exist "sitemap.xml" echo   ✅ sitemap.xml
if exist "robots.txt" echo   ✅ robots.txt
if exist "sitemap_pages.json" echo   ✅ sitemap_pages.json (调试信息)
echo.
echo 📝 下一步操作:
echo 1. 检查生成的sitemap.xml文件
echo 2. 修改sitemap_config.json中的域名
echo 3. 将sitemap.xml和robots.txt上传到网站根目录
echo 4. 在Google Search Console中提交sitemap
echo ========================================
echo.
pause 