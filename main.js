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
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    
    // 将动画放置在屏幕中央而不是点击位置
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 使用窗口中心点
    ripple.style.left = (windowWidth / 2 - 50) + 'px';
    ripple.style.top = (windowHeight / 2 - 50) + 'px';
    ripple.style.width = '100px';
    ripple.style.height = '100px';

    document.body.appendChild(ripple);

    // 动画结束后移除元素
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// 显示主题指示器
function showThemeIndicator(theme) {
    // 移除已存在的指示器
    const existingIndicator = document.querySelector('.theme-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    const indicator = document.createElement('div');
    indicator.className = 'theme-indicator';
    
    const icon = theme === 'dark' ? '🌙' : '☀️';
    indicator.innerHTML = icon;
    
    // 将指示器放置在屏幕中央
    indicator.style.top = '50%';
    indicator.style.left = '50%';
    indicator.style.transform = 'translate(-50%, -50%)';
    indicator.style.right = 'auto'; // 移除右侧定位

    document.body.appendChild(indicator);

    // 显示动画
    requestAnimationFrame(() => {
        indicator.classList.add('show');
    });

    // 隐藏动画
    setTimeout(() => {
        indicator.classList.remove('show');
        indicator.classList.add('hide');
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }, 800);
}

// 主题切换动画
function animateThemeTransition(clickX, clickY) {
    // 创建圆形扩散效果 - 忽略点击位置参数
    createRippleEffect();
    
    // 在切换前添加统一过渡类
    document.documentElement.classList.add('theme-transitioning');
    
    // 添加页面过渡效果
    document.body.style.transition = 'all 0.4s ease';
    
    // 重置过渡效果
    setTimeout(() => {
        document.body.style.transition = '';
        // 移除统一过渡类
        document.documentElement.classList.remove('theme-transitioning');
    }, 400);
}

// 切换主题
if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // 获取点击位置
        const rect = themeToggle.getBoundingClientRect();
        const clickX = rect.left + rect.width / 2;
        const clickY = rect.top + rect.height / 2;

        // 播放切换动画
        animateThemeTransition(clickX, clickY);

        // 立即切换主题
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        // 显示主题指示器
        setTimeout(() => {
            showThemeIndicator(newTheme);
        }, 100);
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initSearchContent();

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

    // 回到顶部按钮逻辑
    const backToTopButton = document.querySelector('.back-to-top');

    if (backToTopButton) {
        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // 点击回到顶部
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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

