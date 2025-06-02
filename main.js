// 使用立即执行函数来设置初始主题，避免闪烁
(function() {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    // 如果有保存的主题，就使用它；否则默认使用深色主题
    const initialTheme = savedTheme || 'dark';
    // 立即设置主题，不等待DOM加载
    document.documentElement.setAttribute('data-theme', initialTheme);
})();

// 主题切换功能
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

// 页面加载完成后更新图标
document.addEventListener('DOMContentLoaded', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateThemeIcon(currentTheme);
});

// 更新主题图标
function updateThemeIcon(theme) {
    if (!themeIcon) return;

    // 添加切换动画类
    themeToggle.classList.add('switching');

    setTimeout(() => {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon', 'fa-adjust');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun', 'fa-adjust');
            themeIcon.classList.add('fa-moon');
        }
        themeToggle.classList.remove('switching');
    }, 200);
}

// 创建圆形扩散动画
function createRippleEffect(x, y) {
    // 移除了扩散动画效果
    return;
}

// 显示主题指示器
function showThemeIndicator(theme) {
    // 移除了主题指示器动画效果
    return;
}

// 主题切换动画
function animateThemeTransition(clickX, clickY) {
    // 移除了所有动画效果
    return;
}

// 切换主题
if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // 立即切换主题，无动画
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // 发布主题变化事件
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: newTheme } 
        }));
    });
}

// 监听系统主题变化（仅当用户未手动设置主题时）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // 只有当用户没有手动设置主题时，才根据系统主题变化
    if (!localStorage.getItem('theme')) {
        // 即使系统主题变化，仍然保持我们的默认主题（深色）
        const newTheme = 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

document.getElementById('current-year').textContent = new Date().getFullYear();

// 添加移动端导航切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-active');
            // 切换图标
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('mobile-active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
        
        // 点击导航链接后关闭菜单
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('mobile-active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-bars';
                    }
                }
            });
        });
    }
    
    // 其余现有代码
    // ... existing code ...
});

// 创建全新的返回顶部按钮 (v3 - Sleek Compact)
function createBackToTopButton() {
    // 彻底移除所有已知的旧按钮实例
    const oldButtonSelectors = [
        '.back-to-top-new', 
        '.modern-back-to-top', 
        '.floating-back-to-top', 
        '.sleek-back-to-top' // 也包括当前尝试创建的按钮，以防重复执行
    ];
    oldButtonSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(btn => btn.remove());
    });

    // 移除旧样式 (if any)
    const oldStyle = document.getElementById('back-to-top-style');
    if (oldStyle) {
        oldStyle.remove();
    }

    // 创建新按钮元素
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'sleek-back-to-top';
    backToTopButton.setAttribute('aria-label', '返回顶部');
    
    // 创建SVG图标
    backToTopButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 8.293l-6.293 6.293a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 01-1.414 1.414L12 8.293z"/>
        </svg>
    `;

    document.body.appendChild(backToTopButton);

    // 添加CSS样式
    const styleSheet = document.createElement('style');
    styleSheet.id = 'back-to-top-style';
    styleSheet.textContent = `
        .sleek-back-to-top {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 48px;
            height: 48px;
            background-color: var(--button-bg-color, rgba(0, 0, 0, 0.7));
            border: 1px solid var(--button-border-color, rgba(255, 255, 255, 0.2));
            border-radius: 12px;
            color: var(--button-icon-color, #ffffff);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sleek-back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }
        .sleek-back-to-top:hover {
            background-color: var(--button-bg-hover-color, rgba(0, 0, 0, 0.9));
            border-color: var(--button-border-hover-color, rgba(255, 255, 255, 0.3));
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        .sleek-back-to-top:active {
            transform: translateY(0) scale(0.95);
            background-color: var(--button-bg-active-color, rgba(0, 0, 0, 0.6));
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .sleek-back-to-top svg {
            width: 22px;
            height: 22px;
            fill: currentColor;
            transition: transform 0.2s ease;
        }
        .sleek-back-to-top:hover svg {
           transform: scale(1.1);
        }

        /* Theme variables for the button */
        :root {
            --button-bg-color-dark: rgba(30, 30, 30, 0.8);
            --button-border-color-dark: rgba(80, 80, 80, 0.7);
            --button-icon-color-dark: var(--neon-cyan, #00ffff);
            --button-bg-hover-color-dark: rgba(50, 50, 50, 0.9);
            --button-border-hover-color-dark: var(--neon-cyan, #00ffff);
            --button-bg-active-color-dark: rgba(20, 20, 20, 0.7);

            --button-bg-color-light: rgba(255, 255, 255, 0.9);
            --button-border-color-light: rgba(200, 200, 200, 0.8);
            --button-icon-color-light: var(--neon-blue, #007bff);
            --button-bg-hover-color-light: rgba(240, 240, 240, 1);
            --button-border-hover-color-light: var(--neon-blue, #007bff);
            --button-bg-active-color-light: rgba(230, 230, 230, 0.9);
        }

        [data-theme="dark"] .sleek-back-to-top {
            --button-bg-color: var(--button-bg-color-dark);
            --button-border-color: var(--button-border-color-dark);
            --button-icon-color: var(--button-icon-color-dark);
            --button-bg-hover-color: var(--button-bg-hover-color-dark);
            --button-border-hover-color: var(--button-border-hover-color-dark);
            --button-bg-active-color: var(--button-bg-active-color-dark);
        }

        [data-theme="light"] .sleek-back-to-top {
            --button-bg-color: var(--button-bg-color-light);
            --button-border-color: var(--button-border-color-light);
            --button-icon-color: var(--button-icon-color-light);
            --button-bg-hover-color: var(--button-bg-hover-color-light);
            --button-border-hover-color: var(--button-border-hover-color-light);
            --button-bg-active-color: var(--button-bg-active-color-light);
        }

        @media (max-width: 768px) {
            .sleek-back-to-top {
                width: 42px;
                height: 42px;
                bottom: 20px;
                right: 20px;
                border-radius: 10px;
            }
            .sleek-back-to-top svg {
                width: 20px;
                height: 20px;
            }
        }
    `;
    document.head.appendChild(styleSheet);

    // 点击事件
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 滚动显示/隐藏
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    // Initial check
    if (window.scrollY > 200) {
        backToTopButton.classList.add('visible');
    }
}

// 独立的返回顶部按钮功能
function initBackToTop() {
    createBackToTopButton();
}

// Ensure the initBackToTop is called after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
    initBackToTop(); // Or call it directly if DOM is already loaded
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initSearchContent();
    initBackToTop(); // 添加返回顶部按钮初始化

    // 搜索按钮点击事件
    if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
    }

    // 关闭按钮点击事件
    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    // 搜索输入事件
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // ESC键关闭搜索
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('active')) {
            closeSearch();
        }

        // Ctrl/Cmd + K 打开搜索
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (!searchOverlay.classList.contains('active')) {
                openSearch();
            }
        }
    });

    // 点击遮罩层关闭搜索
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });
    }

    // 导航栏滚动效果
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // 添加兼容Safari的剪贴板功能
    const citationButtons = document.querySelectorAll('.citation-btn');
    citationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bibtex = this.getAttribute('data-bibtex');
            copyToClipboard(bibtex);
        });
    });

    // 技术栈项目悬停效果
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-3px) scale(1.05)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });

    // 项目卡片3D效果
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 检查talks数量并调整布局
    const talksGrid = document.querySelector('.talks-grid');
    if (talksGrid) {
        const talkCards = talksGrid.querySelectorAll('.talk-card');
        if (talkCards.length === 1) {
            talksGrid.classList.add('single-talk');
        }
    }

    // 添加页面加载动画
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// 页脚动态功能
function initFooter() {
    // 更新当前年份
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // 更新最后更新时间
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        lastUpdatedElement.textContent = `${year}年${month}月`;
    }

    // 访问统计功能（可以连接到实际的统计服务）
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
        // 这里可以连接到实际的访问统计API
        // 目前显示一个友好的消息
        const messages = [
            '感谢您的访问！',
            '欢迎来到我的学术主页',
            '很高兴与您分享我的研究',
            '期待与您的学术交流'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        visitorCountElement.textContent = randomMessage;
    }

    // 为页脚链接添加悬浮效果
    const footerLinks = document.querySelectorAll('.footer-section a');
    footerLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // 为页脚底部的"回到顶部"链接添加平滑滚动
    const backToTopLinks = document.querySelectorAll('a[href="#"]');
    backToTopLinks.forEach(link => {
        if (link.textContent.includes('回到顶部')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    });
}

// 页面加载完成后初始化页脚
document.addEventListener('DOMContentLoaded', function() {
    initFooter();
    
    // 特别为easyScholar插件添加支持
    initEasyScholarSupport();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
} else {
    initFooter();
}

// 引用模态对话框功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取模态对话框元素
    const citationModal = document.getElementById('citation-modal');
    const citationText = document.getElementById('citation-text');
    const closeBtn = document.querySelector('.citation-close');
    const copyBtn = document.getElementById('copy-citation-btn');
    
    // 为所有引用按钮添加点击事件
    document.querySelectorAll('.citation-button').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // 获取引用文件路径
            const citationFile = this.getAttribute('data-citation-file');
            if (!citationFile) return;
            
            try {
                // 获取引用文件内容
                const response = await fetch(citationFile);
                if (!response.ok) {
                    throw new Error('无法加载引用文件');
                }
                
                const data = await response.text();
                citationText.textContent = data;
                
                // 显示模态对话框
                citationModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // 防止背景滚动
            } catch (error) {
                console.error('获取引用信息出错:', error);
                alert('获取引用信息失败，请稍后再试。');
            }
        });
    });
    
    // 关闭模态对话框
    closeBtn.addEventListener('click', function() {
        citationModal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    });
    
    // 点击模态对话框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === citationModal) {
            citationModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // 复制引用内容
    copyBtn.addEventListener('click', function() {
        const text = citationText.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                // 显示复制成功反馈
                copyBtn.classList.add('copy-success');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> 复制成功';
                
                // 3秒后恢复按钮状态
                setTimeout(() => {
                    copyBtn.classList.remove('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制引用';
                }, 3000);
            }).catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制。');
            });
        } else {
            // 备用复制方法
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    copyBtn.classList.add('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> 复制成功';
                    
                    setTimeout(() => {
                        copyBtn.classList.remove('copy-success');
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制引用';
                    }, 3000);
                } else {
                    alert('复制失败，请手动复制。');
                }
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制。');
            }
            
            document.body.removeChild(textarea);
        }
    });
});

