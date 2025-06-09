// 立即执行函数，在页面加载前就开始保护页面
(function() {
    // 标记是否已显示警告
    let warningShown = false;
    let devToolsActive = false;
    
    // 检测开发者工具状态的阈值设置
    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 250;
        const heightThreshold = window.outerHeight - window.innerHeight > 250;
        
        // 检测 Firefox 的开发者工具
        const firefoxDevTools = /Firefox\//.test(navigator.userAgent) && 
            window.console && 
            (window.console.firebug || (window.console.table && window.console.clear));
        
        // 检测 Chrome 的开发者工具状态
        const chromeDevTools = widthThreshold || heightThreshold;
        
        return chromeDevTools || firefoxDevTools;
    }
    
    // 定义处理开发者工具的函数
    function handleDevTools() {
        if (detectDevTools()) {
            devToolsActive = true;
            
            // 不重复显示警告
            if (!warningShown) {
                warningShown = true;
                alert("banned by the developer");
                
                // 在警告框关闭后，检查开发者工具是否仍在运行
                setTimeout(function() {
                    if (detectDevTools()) {
                        // 如果开发者工具仍在运行，强制刷新页面
                        window.location.reload();
                    } else {
                        // 如果已关闭，重置警告标记
                        warningShown = false;
                        devToolsActive = false;
                    }
                }, 100);
            }
            
            // 如果开发者工具已打开，增加检测频率
            if (devToolsActive) {
                setTimeout(handleDevTools, 500);
            }
            
            return true;
        }
        
        // 如果没有检测到开发者工具
        devToolsActive = false;
        return false;
    }
    
    // 初始检测
    handleDevTools();
    
    // 持续定期检测开发者工具状态
    setInterval(handleDevTools, 2000);
    
    // 处理窗口大小变化事件（可能是由于开发者工具被打开）
    window.addEventListener('resize', function() {
        handleDevTools();
    });
    
    // 集中处理所有键盘事件，确保只有一个处理器
    document.addEventListener('keydown', function(e) {
        // 处理F12键
        if (e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            
            // 标记用户尝试打开开发者工具
            handleDevTools();
            
            return false;
        }
        
        // 处理Ctrl+Shift+I组合键
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
            e.stopPropagation();
            handleDevTools();
            return false;
        }
        
        // 处理Ctrl+U组合键
        if (e.ctrlKey && (e.keyCode === 85 || e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            e.stopPropagation();
            alert("banned by the developer");
            return false;
        }
    }, true);
    
    // 禁用右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, true);
    
    // 创建定期检查函数
    function createPeriodicChecker() {
        return setInterval(function() {
            if (detectDevTools()) {
                if (!warningShown) {
                    warningShown = true;
                    alert("banned by the developer");
                    
                    // 在警告框关闭后检查开发者工具是否仍打开
                    setTimeout(function() {
                        if (detectDevTools()) {
                            window.location.reload();
                        } else {
                            warningShown = false;
                        }
                    }, 100);
                } else if (devToolsActive) {
                    // 如果已经显示过警告并且开发者工具仍在运行，强制刷新
                    window.location.reload();
                }
            } else {
                warningShown = false;
                devToolsActive = false;
            }
        }, 1000);
    }
    
    // 启动定期检查
    const periodicChecker = createPeriodicChecker();
})();

// 使用立即执行函数来设置初始主题，避免闪烁
(function() {
    // 检查本地存储中的主题设置
    const savedTheme = localStorage.getItem('theme');
    // 如果有保存的主题，就使用它；否则默认使用浅色主题
    const initialTheme = savedTheme || 'light';
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

    // 移除延时操作，立即切换图标
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon', 'fa-adjust');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun', 'fa-adjust');
        themeIcon.classList.add('fa-moon');
    }
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
        // 即使系统主题变化，仍然保持我们的默认主题（浅色）
        const newTheme = 'light';
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
    
    // 创建带有进度条的按钮结构
    backToTopButton.innerHTML = `
        <svg class="progress-ring" viewBox="0 0 50 50">
            <circle class="progress-ring__circle-bg" cx="25" cy="25" r="20" />
            <circle class="progress-ring__circle" cx="25" cy="25" r="20" />
        </svg>
        <span class="arrow-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                <path d="M12 8.293l-6.293 6.293a1 1 0 01-1.414-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 01-1.414 1.414L12 8.293z"/>
            </svg>
        </span>
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
            width: 50px;
            height: 50px;
            background-color: var(--button-bg-color, rgba(0, 0, 0, 0.7));
            border: none;
            border-radius: 50%;
            color: var(--button-icon-color, #ffffff);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }
        
        .sleek-back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }
        
        .sleek-back-to-top:hover {
            background-color: var(--button-bg-hover-color, rgba(0, 0, 0, 0.9));
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        .sleek-back-to-top:active {
            transform: translateY(0) scale(0.95);
            background-color: var(--button-bg-active-color, rgba(0, 0, 0, 0.6));
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .sleek-back-to-top .arrow-icon {
            position: absolute;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }
        
        .sleek-back-to-top .arrow-icon svg {
            fill: currentColor;
            transition: transform 0.2s ease;
        }
        
        .sleek-back-to-top:hover .arrow-icon svg {
            transform: scale(1.1);
        }
        
        .progress-ring {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
            z-index: 1;
        }
        
        .progress-ring__circle-bg {
            fill: transparent;
            stroke: var(--button-border-color, rgba(255, 255, 255, 0.2));
            stroke-width: 2;
        }
        
        .progress-ring__circle {
            fill: transparent;
            stroke: var(--button-progress-color, var(--neon-cyan, #00ffff));
            stroke-width: 2;
            stroke-dasharray: 125.6;
            stroke-dashoffset: 125.6;
            transition: stroke-dashoffset 0.3s ease;
        }

        /* Theme variables for the button */
        :root {
            --button-bg-color-dark: rgba(30, 30, 30, 0.8);
            --button-border-color-dark: rgba(80, 80, 80, 0.7);
            --button-icon-color-dark: #ffffff;
            --button-progress-color-dark: var(--neon-cyan, #00ffff);
            --button-bg-hover-color-dark: rgba(50, 50, 50, 0.9);
            --button-bg-active-color-dark: rgba(20, 20, 20, 0.7);

            --button-bg-color-light: rgba(255, 255, 255, 0.9);
            --button-border-color-light: rgba(200, 200, 200, 0.8);
            --button-icon-color-light: #333333;
            --button-progress-color-light: var(--neon-blue, #007bff);
            --button-bg-hover-color-light: rgba(240, 240, 240, 1);
            --button-bg-active-color-light: rgba(230, 230, 230, 0.9);
        }

        [data-theme="dark"] .sleek-back-to-top {
            --button-bg-color: var(--button-bg-color-dark);
            --button-border-color: var(--button-border-color-dark);
            --button-icon-color: var(--button-icon-color-dark);
            --button-progress-color: var(--button-progress-color-dark);
            --button-bg-hover-color: var(--button-bg-hover-color-dark);
            --button-bg-active-color: var(--button-bg-active-color-dark);
        }

        [data-theme="light"] .sleek-back-to-top {
            --button-bg-color: var(--button-bg-color-light);
            --button-border-color: var(--button-border-color-light);
            --button-icon-color: var(--button-icon-color-light);
            --button-progress-color: var(--button-progress-color-light);
            --button-bg-hover-color: var(--button-bg-hover-color-light);
            --button-bg-active-color: var(--button-bg-active-color-light);
        }

        @media (max-width: 768px) {
            .sleek-back-to-top {
                width: 45px;
                height: 45px;
                bottom: 20px;
                right: 20px;
            }
            .sleek-back-to-top .arrow-icon {
                width: 20px;
                height: 20px;
            }
            .sleek-back-to-top .arrow-icon svg {
                width: 12px;
                height: 12px;
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

    // 获取进度环元素
    const progressCircle = backToTopButton.querySelector('.progress-ring__circle');
    const circumference = 2 * Math.PI * 20; // 2πr，r=20 (circle radius)
    
    // 设置初始周长
    if (progressCircle) {
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
    }

    // 更新进度条函数
    function updateProgressBar() {
        if (!progressCircle) return;
        
        // 计算滚动进度百分比
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = scrollTop / scrollHeight;
        
        // 计算stroke-dashoffset值
        const offset = circumference - (scrollPercentage * circumference);
        progressCircle.style.strokeDashoffset = offset;
    }

    // 滚动显示/隐藏和更新进度条
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
        
        // 更新进度条
        updateProgressBar();
    });
    
    // Initial check
    if (window.scrollY > 200) {
        backToTopButton.classList.add('visible');
    }
    
    // 初始更新进度条
    updateProgressBar();
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
            'Thank you for visiting!',
            'Welcome to my academic homepage',
            'I am glad to share my research with you',
            'Looking forward to academic exchange with you'
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
    
    // 禁止F12、右键菜单和其他调试工具
    disableDevTools();
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooter);
} else {
    initFooter();
}

// 禁止F12、右键菜单和其他调试工具
function disableDevTools() {
    // 禁用F12键和其他开发者工具快捷键
    document.addEventListener('keydown', function(event) {
        // F12键被按下
        if(event.keyCode === 123) {
            event.preventDefault();
            window.location.href = window.location.href;
            return false;
        }
        
        // Ctrl+Shift+I 组合键
        if(event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 105)) {
            event.preventDefault();
            window.location.href = window.location.href;
            return false;
        }
        
        // Ctrl+Shift+J 组合键
        if(event.ctrlKey && event.shiftKey && (event.keyCode === 74 || event.keyCode === 106)) {
            event.preventDefault();
            window.location.href = window.location.href;
            return false;
        }
        
        // Ctrl+Shift+C 组合键
        if(event.ctrlKey && event.shiftKey && (event.keyCode === 67 || event.keyCode === 99)) {
            event.preventDefault();
            window.location.href = window.location.href;
            return false;
        }
        
        // Ctrl+U 组合键 (查看源代码)
        if(event.ctrlKey && (event.keyCode === 85 || event.keyCode === 117)) {
            event.preventDefault();
            window.location.href = window.location.href;
            return false;
        }
    }, true);
    
    // 禁用右键菜单
    document.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        return false;
    }, true);
    
    // 重写控制台方法
    (function() {
        try {
            // 保存原始console方法的引用
            const originalConsole = {
                log: console.log,
                error: console.error,
                warn: console.warn,
                debug: console.debug,
                info: console.info,
                table: console.table,
                clear: console.clear
            };
            
            // 重写console方法
            console.log = console.error = console.warn = console.debug = console.info = console.table = function() {
                // 检测调用堆栈以确定是否是开发者工具调用
                const stack = new Error().stack || '';
                if (stack.indexOf('devtools') > -1 || stack.indexOf('console') > -1) {
                    window.location.href = window.location.href;
                }
                // 对于合法的调用，保持原有功能
                return originalConsole.log.apply(console, arguments);
            };
        } catch (e) {}
    })();
    
    // 检测窗口大小变化（可能是由于开发者工具打开导致）
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
        if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
            // 可能是开发者工具打开导致的窗口大小变化
            document.body.innerHTML = '';
            window.location.href = window.location.href;
        }
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    });
    
    // 使用更激进的debugger陷阱
    function setupDebuggerTrap() {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        
        // 如果debugger语句执行时间过长，可能是开发者工具在处理它
        if (end - start > 100) {
            window.location.href = window.location.href;
        }
    }
    
    // 使用定时器定期检查
    setInterval(function() {
        setupDebuggerTrap();
        
        // 检测控制台是否打开
        const isConsoleOpen = /./;
        isConsoleOpen.toString = function() {
            window.location.href = window.location.href;
            return '';
        };
        console.log('%c', isConsoleOpen);
        console.clear();
        
        // 通过元素大小检测开发者工具
        if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
            document.body.innerHTML = '';
            window.location.href = window.location.href;
        }
    }, 1000);
    
    // 使用严格的eval调试检测
    (function() {
        function detect() {
            try {
                if (typeof global !== "undefined") return true;
                if (typeof process !== "undefined") return true;
                if (typeof module !== "undefined") return true;
                if (typeof require !== "undefined") return true;
                if (window.outerHeight - window.innerHeight > 160) return true;
                if (window.outerWidth - window.innerWidth > 160) return true;
                if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) return true;
                
                // 检测Firefox开发者工具
                const firefoxDev = /firefox/i.test(navigator.userAgent) && /devtools/i.test(new Error().stack);
                if (firefoxDev) return true;
                
                return false;
            } catch (e) {
                return false;
            }
        }
        
        if (detect()) {
            document.body.innerHTML = '';
            window.location.href = window.location.href;
        }
    })();
    
    // 使用高级混淆的debugger调用
    (function() {
        try {
            const encoded = "ZnVuY3Rpb24gY2hlY2soKXt0cnl7ZnVuY3Rpb24geChhKXtpZigoJycrYS9hKS5sZW5ndGghPT0xfHxhJTIwPT09MCl7KGZ1bmN0aW9uKCl7fSkuY29uc3RydWN0b3IoJ2RlYnVnZ2VyJykoKX1lbHNle2RlYnVnZ2VyfXgoKythKX14KDApfWNhdGNoKGUpe3NldFRpbWVvdXQoY2hlY2ssMTAwMCl9fWNoZWNrKCk7";
            eval(atob(encoded));
        } catch (e) {}
    })();
    
    // 检测开发者工具通过firebug
    if (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
        document.body.innerHTML = '';
        window.location.href = window.location.href;
    }
    
    // 防止元素检查
    document.addEventListener('DOMNodeInserted', function(e) {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'div' && e.target.id === 'FirebugUI') {
            document.body.innerHTML = '';
            window.location.href = window.location.href;
        }
    }, true);
    
    // 使用Canvas指纹检测开发者工具
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (vendor.indexOf('Developer') > -1 || renderer.indexOf('Developer') > -1) {
                    window.location.href = window.location.href;
                }
            }
        }
    } catch (e) {}
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
                    throw new Error('Failed to load citation file');
                }
                
                const data = await response.text();
                citationText.textContent = data;
                
                // 显示模态对话框
                citationModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // 防止背景滚动
            } catch (error) {
                console.error('Error getting citation information:', error);
                alert('Failed to get citation information, please try again later.');
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
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copy Success';
                
                // 3秒后恢复按钮状态
                setTimeout(() => {
                    copyBtn.classList.remove('copy-success');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Citation';
                }, 3000);
            }).catch(err => {
                console.error('Copy failed:', err);
                alert('Copy failed, please copy manually.');
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
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copy Success';
                    
                    setTimeout(() => {
                        copyBtn.classList.remove('copy-success');
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Citation';
                    }, 3000);
                } else {
                    alert('Copy failed, please copy manually.');
                }
            } catch (err) {
                console.error('Copy failed:', err);
                alert('Copy failed, please copy manually.');
            }
            
            document.body.removeChild(textarea);
        }
    });
});

