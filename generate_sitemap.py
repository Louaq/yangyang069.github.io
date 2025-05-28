#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网站地图生成器
自动生成sitemap.xml文件，包含网站的所有重要页面
"""

import xml.etree.ElementTree as ET
from datetime import datetime
import os

def generate_sitemap():
    """生成sitemap.xml文件"""
    
    # 网站基础URL - 请根据实际情况修改
    BASE_URL = "https://yourdomain.com"  # 请替换为你的实际域名
    
    # 创建根元素
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    urlset.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    urlset.set("xsi:schemaLocation", "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd")
    
    # 获取当前时间
    current_time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+00:00")
    
    # 定义页面信息
    pages = [
        {
            "loc": f"{BASE_URL}/",
            "lastmod": current_time,
            "changefreq": "weekly",
            "priority": "1.0"
        },
        {
            "loc": f"{BASE_URL}/#about-me",
            "lastmod": current_time,
            "changefreq": "monthly",
            "priority": "0.8"
        },
        {
            "loc": f"{BASE_URL}/#publications",
            "lastmod": current_time,
            "changefreq": "monthly",
            "priority": "0.9"
        },
        {
            "loc": f"{BASE_URL}/#talks",
            "lastmod": current_time,
            "changefreq": "monthly",
            "priority": "0.8"
        },
        {
            "loc": f"{BASE_URL}/#tech-stack",
            "lastmod": current_time,
            "changefreq": "monthly",
            "priority": "0.7"
        },
        {
            "loc": f"{BASE_URL}/#experience",
            "lastmod": current_time,
            "changefreq": "monthly",
            "priority": "0.8"
        },
        {
            "loc": f"{BASE_URL}/#academic-activities",
            "lastmod": current_time,
            "changefreq": "monthly",
            "priority": "0.7"
        }
    ]
    
    # 为每个页面创建URL元素
    for page in pages:
        url = ET.SubElement(urlset, "url")
        
        loc = ET.SubElement(url, "loc")
        loc.text = page["loc"]
        
        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = page["lastmod"]
        
        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = page["changefreq"]
        
        priority = ET.SubElement(url, "priority")
        priority.text = page["priority"]
    
    # 创建XML树
    tree = ET.ElementTree(urlset)
    
    # 格式化XML
    ET.indent(tree, space="  ", level=0)
    
    # 写入文件
    tree.write("sitemap.xml", encoding="utf-8", xml_declaration=True)
    
    print(f"✅ sitemap.xml 已生成成功！")
    print(f"📅 生成时间: {current_time}")
    print(f"📄 包含 {len(pages)} 个页面")
    
    # 显示生成的页面列表
    print("\n📋 包含的页面:")
    for i, page in enumerate(pages, 1):
        print(f"  {i}. {page['loc']} (优先级: {page['priority']})")

def validate_sitemap():
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
        print(f"✅ sitemap.xml 验证通过！包含 {len(urls)} 个URL")
        return True
        
    except ET.ParseError as e:
        print(f"❌ sitemap.xml 解析错误: {e}")
        return False

if __name__ == "__main__":
    print("🚀 开始生成网站地图...")
    print("=" * 50)
    
    # 生成sitemap
    generate_sitemap()
    
    print("\n" + "=" * 50)
    print("🔍 验证生成的sitemap...")
    
    # 验证sitemap
    validate_sitemap()
    
    print("\n" + "=" * 50)
    print("💡 提示:")
    print("1. 请在脚本中修改 BASE_URL 为你的实际域名")
    print("2. 将生成的 sitemap.xml 文件上传到网站根目录")
    print("3. 在 Google Search Console 中提交sitemap")
    print("4. 可以将此脚本添加到部署流程中自动执行") 