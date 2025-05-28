#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能网站地图生成器
自动解析HTML文件并生成完整的sitemap.xml
支持自动检测页面内容和更新频率
"""

import xml.etree.ElementTree as ET
from datetime import datetime
import os
import re
from bs4 import BeautifulSoup
import json

class SitemapGenerator:
    def __init__(self, base_url="https://yourdomain.com", html_file="index.html"):
        self.base_url = base_url.rstrip('/')
        self.html_file = html_file
        self.current_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+00:00")
        
    def parse_html_content(self):
        """解析HTML文件，提取页面信息"""
        if not os.path.exists(self.html_file):
            print(f"❌ HTML文件 {self.html_file} 不存在")
            return []
        
        try:
            with open(self.html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            pages = []
            
            # 主页
            pages.append({
                "loc": f"{self.base_url}/",
                "lastmod": self.current_time,
                "changefreq": "weekly",
                "priority": "1.0",
                "title": "首页"
            })
            
            # 查找所有section元素
            sections = soup.find_all('section', id=True)
            
            for section in sections:
                section_id = section.get('id')
                if section_id:
                    # 获取section标题
                    title_elem = section.find(['h1', 'h2', 'h3'])
                    title = title_elem.get_text().strip() if title_elem else section_id.replace('-', ' ').title()
                    
                    # 根据section类型设置优先级和更新频率
                    priority, changefreq = self._get_section_priority(section_id, section)
                    
                    pages.append({
                        "loc": f"{self.base_url}/#{section_id}",
                        "lastmod": self.current_time,
                        "changefreq": changefreq,
                        "priority": priority,
                        "title": title
                    })
            
            # 查找导航链接
            nav_links = soup.find_all('a', href=re.compile(r'^#'))
            for link in nav_links:
                href = link.get('href')
                if href and href.startswith('#') and len(href) > 1:
                    section_id = href[1:]  # 移除#号
                    
                    # 检查是否已经添加过这个链接
                    if not any(page['loc'].endswith(f'#{section_id}') for page in pages):
                        title = link.get_text().strip() or section_id.replace('-', ' ').title()
                        priority, changefreq = self._get_section_priority(section_id)
                        
                        pages.append({
                            "loc": f"{self.base_url}/{href}",
                            "lastmod": self.current_time,
                            "changefreq": changefreq,
                            "priority": priority,
                            "title": title
                        })
            
            return pages
            
        except Exception as e:
            print(f"❌ 解析HTML文件时出错: {e}")
            return []
    
    def _get_section_priority(self, section_id, section_elem=None):
        """根据section类型确定优先级和更新频率"""
        priority_map = {
            'about': ('0.9', 'monthly'),
            'about-me': ('0.9', 'monthly'),
            'publications': ('0.9', 'monthly'),
            'papers': ('0.9', 'monthly'),
            'research': ('0.9', 'monthly'),
            'talks': ('0.8', 'monthly'),
            'presentations': ('0.8', 'monthly'),
            'projects': ('0.8', 'monthly'),
            'experience': ('0.8', 'monthly'),
            'education': ('0.8', 'monthly'),
            'skills': ('0.7', 'monthly'),
            'tech-stack': ('0.7', 'monthly'),
            'contact': ('0.6', 'yearly'),
            'activities': ('0.7', 'monthly'),
            'academic-activities': ('0.7', 'monthly'),
            'awards': ('0.7', 'monthly'),
            'blog': ('0.8', 'weekly'),
            'news': ('0.8', 'weekly'),
        }
        
        # 检查section_id是否包含关键词
        for keyword, (priority, changefreq) in priority_map.items():
            if keyword in section_id.lower():
                return priority, changefreq
        
        # 如果有section元素，检查其内容
        if section_elem:
            # 检查是否包含publication相关内容
            if section_elem.find_all(['article', 'div'], class_=re.compile(r'publication|paper')):
                return '0.9', 'monthly'
            
            # 检查是否包含project相关内容
            if section_elem.find_all(['div'], class_=re.compile(r'project|work')):
                return '0.8', 'monthly'
        
        # 默认值
        return '0.7', 'monthly'
    
    def generate_sitemap(self):
        """生成sitemap.xml文件"""
        print("🔍 正在解析HTML文件...")
        pages = self.parse_html_content()
        
        if not pages:
            print("❌ 未找到任何页面内容")
            return False
        
        # 去重
        unique_pages = []
        seen_urls = set()
        for page in pages:
            if page['loc'] not in seen_urls:
                unique_pages.append(page)
                seen_urls.add(page['loc'])
        
        print(f"📄 找到 {len(unique_pages)} 个唯一页面")
        
        # 创建XML结构
        urlset = ET.Element("urlset")
        urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
        urlset.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        urlset.set("xsi:schemaLocation", "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd")
        
        # 按优先级排序
        unique_pages.sort(key=lambda x: float(x['priority']), reverse=True)
        
        # 为每个页面创建URL元素
        for page in unique_pages:
            url = ET.SubElement(urlset, "url")
            
            loc = ET.SubElement(url, "loc")
            loc.text = page["loc"]
            
            lastmod = ET.SubElement(url, "lastmod")
            lastmod.text = page["lastmod"]
            
            changefreq = ET.SubElement(url, "changefreq")
            changefreq.text = page["changefreq"]
            
            priority = ET.SubElement(url, "priority")
            priority.text = page["priority"]
        
        # 创建XML树并格式化
        tree = ET.ElementTree(urlset)
        ET.indent(tree, space="  ", level=0)
        
        # 写入文件
        tree.write("sitemap.xml", encoding="utf-8", xml_declaration=True)
        
        print(f"✅ sitemap.xml 已生成成功！")
        print(f"📅 生成时间: {self.current_time}")
        print(f"📄 包含 {len(unique_pages)} 个页面")
        
        # 显示生成的页面列表
        print("\n📋 包含的页面:")
        for i, page in enumerate(unique_pages, 1):
            print(f"  {i}. {page['title']} - {page['loc']} (优先级: {page['priority']})")
        
        # 保存页面信息到JSON文件（用于调试）
        with open("sitemap_pages.json", "w", encoding="utf-8") as f:
            json.dump(unique_pages, f, ensure_ascii=False, indent=2)
        
        return True
    
    def generate_robots_txt(self):
        """生成robots.txt文件"""
        robots_content = f"""User-agent: *
Allow: /

# Sitemap
Sitemap: {self.base_url}/sitemap.xml

# 禁止访问的目录（如果有的话）
# Disallow: /admin/
# Disallow: /private/

# 爬取延迟（可选）
Crawl-delay: 1
"""
        
        with open("robots.txt", "w", encoding="utf-8") as f:
            f.write(robots_content)
        
        print("✅ robots.txt 已生成成功！")
    
    def validate_sitemap(self):
        """验证生成的sitemap.xml文件"""
        if not os.path.exists("sitemap.xml"):
            print("❌ sitemap.xml 文件不存在")
            return False
        
        try:
            tree = ET.parse("sitemap.xml")
            root = tree.getroot()
            
            # 检查根元素
            if root.tag != "{http://www.sitemaps.org/schemas/sitemap/0.9}urlset":
                print("❌ sitemap.xml 格式错误：根元素不正确")
                return False
            
            # 统计URL数量
            urls = root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}url")
            
            # 检查每个URL的完整性
            valid_urls = 0
            for url in urls:
                loc = url.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
                lastmod = url.find("{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod")
                changefreq = url.find("{http://www.sitemaps.org/schemas/sitemap/0.9}changefreq")
                priority = url.find("{http://www.sitemaps.org/schemas/sitemap/0.9}priority")
                
                if all(elem is not None for elem in [loc, lastmod, changefreq, priority]):
                    valid_urls += 1
            
            print(f"✅ sitemap.xml 验证通过！")
            print(f"📊 总URL数量: {len(urls)}")
            print(f"📊 有效URL数量: {valid_urls}")
            
            return True
            
        except ET.ParseError as e:
            print(f"❌ sitemap.xml 解析错误: {e}")
            return False

def main():
    print("🚀 智能网站地图生成器")
    print("=" * 60)
    
    # 配置参数
    BASE_URL = "https://yourdomain.com"  # 请修改为你的实际域名
    HTML_FILE = "index.html"
    
    # 检查是否存在配置文件
    config_file = "sitemap_config.json"
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                BASE_URL = config.get('base_url', BASE_URL)
                HTML_FILE = config.get('html_file', HTML_FILE)
            print(f"📝 已加载配置文件: {config_file}")
        except:
            print("⚠️  配置文件格式错误，使用默认配置")
    
    print(f"🌐 网站URL: {BASE_URL}")
    print(f"📄 HTML文件: {HTML_FILE}")
    print("-" * 60)
    
    # 创建生成器实例
    generator = SitemapGenerator(BASE_URL, HTML_FILE)
    
    # 生成sitemap
    if generator.generate_sitemap():
        print("\n" + "-" * 60)
        print("🔍 验证生成的sitemap...")
        generator.validate_sitemap()
        
        print("\n" + "-" * 60)
        print("🤖 生成robots.txt...")
        generator.generate_robots_txt()
    
    print("\n" + "=" * 60)
    print("💡 使用提示:")
    print("1. 修改脚本中的 BASE_URL 为你的实际域名")
    print("2. 确保 index.html 文件存在且格式正确")
    print("3. 将生成的文件上传到网站根目录:")
    print("   - sitemap.xml")
    print("   - robots.txt")
    print("4. 在 Google Search Console 中提交sitemap")
    print("5. 可以创建 sitemap_config.json 配置文件:")
    print('   {"base_url": "https://yoursite.com", "html_file": "index.html"}')

if __name__ == "__main__":
    main() 