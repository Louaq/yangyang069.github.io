# 🚀 快速开始指南

## 1分钟生成网站地图

### 第一步：下载文件
确保你的项目目录中有以下文件：
- `auto_sitemap.py` (推荐) 或 `generate_sitemap.py`
- `sitemap_config.json`
- `index.html` (你的网站HTML文件)

### 第二步：修改配置
编辑 `sitemap_config.json`，将域名改为你的实际域名：

```json
{
  "base_url": "https://你的域名.com",
  "html_file": "index.html"
}
```

### 第三步：运行脚本

#### Windows用户
```bash
# 方法1：双击运行
generate_sitemap.bat

# 方法2：命令行运行
python auto_sitemap.py
```

#### Linux/Mac用户
```bash
# 给脚本执行权限
chmod +x generate_sitemap.sh

# 运行脚本
./generate_sitemap.sh

# 或直接运行Python脚本
python3 auto_sitemap.py
```

### 第四步：上传文件
将生成的文件上传到你的网站根目录：
- `sitemap.xml`
- `robots.txt`

### 第五步：提交搜索引擎
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [百度站长平台](https://ziyuan.baidu.com)

## 🎉 完成！

你的网站现在有了专业的sitemap.xml文件，有助于搜索引擎更好地索引你的网站内容。

## 💡 小贴士

1. **定期更新**：每次更新网站内容后重新生成sitemap
2. **检查访问**：确保 `https://你的域名.com/sitemap.xml` 可以正常访问
3. **监控效果**：在Google Search Console中查看sitemap提交状态

## ❓ 遇到问题？

查看完整的 [SITEMAP_README.md](SITEMAP_README.md) 文档获取详细说明和故障排除指南。 