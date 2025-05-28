#!/bin/bash

# 网站地图生成器 - Linux/Mac版本
# 自动生成sitemap.xml和robots.txt文件

set -e  # 遇到错误时退出

echo ""
echo "========================================"
echo "   网站地图生成器 - Linux/Mac版本"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Python是否安装
echo "🔍 检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到Python3，请先安装Python 3.6+${NC}"
    echo "Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "macOS: brew install python3"
    exit 1
fi

echo -e "${GREEN}✅ Python3已安装${NC}"
python3 --version
echo ""

# 检查pip是否安装
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到pip3${NC}"
    exit 1
fi

# 检查并安装依赖
echo "📦 检查依赖包..."
if ! python3 -c "import bs4" &> /dev/null; then
    echo "安装BeautifulSoup4..."
    pip3 install beautifulsoup4 --user
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 安装BeautifulSoup4失败${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ 依赖包检查完成${NC}"
echo ""

# 检查HTML文件是否存在
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ 错误: 未找到index.html文件${NC}"
    echo "请确保在包含index.html的目录中运行此脚本"
    exit 1
fi

echo -e "${GREEN}✅ 找到index.html文件${NC}"
echo ""

# 运行sitemap生成器
echo "🚀 开始生成网站地图..."
echo ""

if [ -f "auto_sitemap.py" ]; then
    python3 auto_sitemap.py
elif [ -f "generate_sitemap.py" ]; then
    python3 generate_sitemap.py
else
    echo -e "${RED}❌ 错误: 未找到sitemap生成脚本${NC}"
    echo "请确保generate_sitemap.py或auto_sitemap.py文件存在"
    exit 1
fi

echo ""
echo "========================================"
echo -e "${GREEN}🎉 网站地图生成完成！${NC}"
echo ""
echo "生成的文件:"
[ -f "sitemap.xml" ] && echo -e "  ${GREEN}✅ sitemap.xml${NC}"
[ -f "robots.txt" ] && echo -e "  ${GREEN}✅ robots.txt${NC}"
[ -f "sitemap_pages.json" ] && echo -e "  ${GREEN}✅ sitemap_pages.json (调试信息)${NC}"
echo ""
echo -e "${BLUE}📝 下一步操作:${NC}"
echo "1. 检查生成的sitemap.xml文件"
echo "2. 修改sitemap_config.json中的域名"
echo "3. 将sitemap.xml和robots.txt上传到网站根目录"
echo "4. 在Google Search Console中提交sitemap"
echo "========================================"
echo ""

# 显示文件大小信息
if [ -f "sitemap.xml" ]; then
    size=$(wc -c < sitemap.xml)
    echo -e "${BLUE}📊 sitemap.xml 文件大小: ${size} 字节${NC}"
fi

# 询问是否查看生成的sitemap
read -p "是否查看生成的sitemap.xml内容? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "======== sitemap.xml 内容 ========"
    cat sitemap.xml
    echo ""
    echo "=================================="
fi 