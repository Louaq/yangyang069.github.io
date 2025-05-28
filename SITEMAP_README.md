# 网站地图生成器 (Sitemap Generator)

自动生成符合搜索引擎标准的 `sitemap.xml` 和 `robots.txt` 文件，提升网站SEO效果。

## 🚀 功能特性

- ✅ **智能解析**: 自动解析HTML文件，提取所有页面和锚点链接
- ✅ **优先级设置**: 根据页面类型自动设置合适的优先级和更新频率
- ✅ **配置灵活**: 支持JSON配置文件，可自定义各种参数
- ✅ **多平台支持**: 提供Windows批处理和Linux/Mac shell脚本
- ✅ **验证功能**: 自动验证生成的sitemap.xml格式正确性
- ✅ **robots.txt**: 同时生成robots.txt文件
- ✅ **调试信息**: 生成详细的调试信息文件

## 📁 文件说明

| 文件名 | 说明 |
|--------|------|
| `generate_sitemap.py` | 基础版本的sitemap生成器 |
| `auto_sitemap.py` | 智能版本，可自动解析HTML内容 |
| `sitemap_config.json` | 配置文件，设置域名和各种参数 |
| `generate_sitemap.bat` | Windows批处理脚本 |
| `generate_sitemap.sh` | Linux/Mac shell脚本 |

## 🛠️ 安装依赖

### Python依赖
```bash
pip install beautifulsoup4
```

### 系统要求
- Python 3.6+
- BeautifulSoup4库

## 📖 使用方法

### 方法一：使用脚本（推荐）

#### Windows用户
1. 双击运行 `generate_sitemap.bat`
2. 脚本会自动检查环境并安装依赖
3. 按提示操作即可

#### Linux/Mac用户
```bash
# 给脚本执行权限
chmod +x generate_sitemap.sh

# 运行脚本
./generate_sitemap.sh
```

### 方法二：直接运行Python脚本

```bash
# 基础版本
python generate_sitemap.py

# 智能版本（推荐）
python auto_sitemap.py
```

## ⚙️ 配置说明

### 修改配置文件 `sitemap_config.json`

```json
{
  "base_url": "https://yourdomain.com",  // 修改为你的域名
  "html_file": "index.html",             // HTML文件路径
  "output_dir": "./",                    // 输出目录
  "settings": {
    "generate_robots": true,             // 是否生成robots.txt
    "validate_sitemap": true,            // 是否验证sitemap
    "save_debug_info": true              // 是否保存调试信息
  },
  "custom_priorities": {                 // 自定义优先级
    "about": {
      "priority": "0.9",
      "changefreq": "monthly"
    },
    "publications": {
      "priority": "0.9", 
      "changefreq": "monthly"
    }
  },
  "exclude_sections": [],                // 排除的section
  "additional_urls": [                   // 额外的URL
    {
      "url": "/cv.pdf",
      "priority": "0.8",
      "changefreq": "yearly",
      "title": "CV/Resume"
    }
  ]
}
```

### 重要配置项说明

1. **base_url**: 你的网站域名，必须修改
2. **html_file**: 要解析的HTML文件路径
3. **custom_priorities**: 可以为不同section设置自定义优先级
4. **additional_urls**: 添加额外的URL（如PDF文件等）

## 📊 优先级说明

| 页面类型 | 优先级 | 更新频率 | 说明 |
|----------|--------|----------|------|
| 首页 | 1.0 | weekly | 最高优先级 |
| About/Publications | 0.9 | monthly | 核心内容页面 |
| Talks/Experience | 0.8 | monthly | 重要内容页面 |
| Skills/Activities | 0.7 | monthly | 一般内容页面 |
| Contact | 0.6 | yearly | 联系信息页面 |

## 📋 生成的文件

运行成功后会生成以下文件：

1. **sitemap.xml** - 网站地图文件
2. **robots.txt** - 搜索引擎爬虫指令文件
3. **sitemap_pages.json** - 调试信息文件（可选）

### sitemap.xml 示例
```xml
<?xml version='1.0' encoding='utf-8'?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2024-12-19T10:30:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/#publications</loc>
    <lastmod>2024-12-19T10:30:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

## 🚀 部署到网站

1. **上传文件**: 将生成的 `sitemap.xml` 和 `robots.txt` 上传到网站根目录
2. **验证访问**: 确保可以通过 `https://yourdomain.com/sitemap.xml` 访问
3. **提交搜索引擎**: 
   - Google Search Console: 添加sitemap
   - Bing Webmaster Tools: 提交sitemap
   - 百度站长平台: 提交sitemap

## 🔄 自动化部署

### GitHub Actions 示例

创建 `.github/workflows/sitemap.yml`:

```yaml
name: Generate Sitemap

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # 每周日运行

jobs:
  generate-sitemap:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.8'
    
    - name: Install dependencies
      run: |
        pip install beautifulsoup4
    
    - name: Generate sitemap
      run: |
        python auto_sitemap.py
    
    - name: Commit and push
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add sitemap.xml robots.txt
        git commit -m "Auto-update sitemap" || exit 0
        git push
```

### 定时任务 (Cron)

Linux/Mac系统可以设置定时任务：

```bash
# 编辑crontab
crontab -e

# 添加以下行（每周日凌晨2点运行）
0 2 * * 0 cd /path/to/your/website && python3 auto_sitemap.py
```

## 🐛 故障排除

### 常见问题

1. **Python未找到**
   - 确保安装了Python 3.6+
   - Windows用户确保Python添加到PATH

2. **BeautifulSoup4安装失败**
   ```bash
   # 尝试使用国内镜像
   pip install beautifulsoup4 -i https://pypi.tuna.tsinghua.edu.cn/simple/
   ```

3. **HTML解析错误**
   - 检查index.html文件是否存在
   - 确保HTML格式正确

4. **权限错误**
   ```bash
   # Linux/Mac给脚本执行权限
   chmod +x generate_sitemap.sh
   ```

### 调试模式

如果遇到问题，可以查看生成的 `sitemap_pages.json` 文件来调试：

```bash
# 查看解析到的页面信息
cat sitemap_pages.json
```

## 📞 技术支持

如果遇到问题，请检查：

1. Python版本是否为3.6+
2. 依赖包是否正确安装
3. HTML文件格式是否正确
4. 配置文件是否有语法错误

## 📝 更新日志

- **v1.0.0**: 基础sitemap生成功能
- **v2.0.0**: 添加智能HTML解析
- **v2.1.0**: 添加配置文件支持
- **v2.2.0**: 添加跨平台脚本支持

## 📄 许可证

MIT License - 可自由使用和修改 