// 主题切换功能
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
} else {
    // 如果没有保存的主题，默认使用浅色模式
    const defaultTheme = 'light';
    document.documentElement.setAttribute('data-theme', defaultTheme);
    updateThemeIcon(defaultTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
    if (!themeIcon) return;

    // 添加旋转动画
    themeIcon.style.transform = 'rotate(360deg)';

    setTimeout(() => {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon', 'fa-adjust');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun', 'fa-adjust');
            themeIcon.classList.add('fa-moon');
        }
        themeIcon.style.transform = 'rotate(0deg)';
    }, 150);
}

// 主题切换动画
function animateThemeTransition() {
    document.body.style.transition = 'all 0.3s ease-in-out';

    // 创建一个临时的覆盖层来实现平滑过渡
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        opacity: 0;
        z-index: 9999;
        pointer-events: none;
        transition: opacity 0.15s ease-in-out;
    `;

    document.body.appendChild(overlay);

    // 淡入覆盖层
    requestAnimationFrame(() => {
        overlay.style.opacity = '0.3';
    });

    // 移除覆盖层
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.body.style.transition = '';
        }, 150);
    }, 150);
}

// 显示主题切换通知
function showThemeNotification(theme) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--neon-cyan);
        box-shadow: var(--glow-cyan);
        z-index: 10000;
        font-size: 0.9rem;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        pointer-events: none;
    `;

    const themeText = theme === 'dark' ? '🌙 深色模式' : '☀️ 浅色模式';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${themeText}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // 显示通知
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });

    // 自动隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 切换主题
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // 播放切换动画
        animateThemeTransition();

        // 延迟切换主题以配合动画
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);

            // 显示切换通知
            showThemeNotification(newTheme);
        }, 75);
    });
}

// 监听系统主题变化（但保持默认浅色模式）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        // 即使系统主题变化，也保持默认的浅色模式
        const newTheme = 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

document.getElementById('current-year').textContent = new Date().getFullYear();

// 移动端菜单
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.contains('active');
    const icon = menuToggle.querySelector('i');

    if (isActive) {
        // Closing the menu
        icon.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            navLinks.classList.remove('active');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }, 50);
    } else {
        // Opening the menu
        icon.style.transform = 'rotate(90deg)';
        navLinks.classList.add('active');
        setTimeout(() => {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }, 200);
    }
});

// 点击导航链接时关闭菜单
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const icon = menuToggle.querySelector('i');
        icon.style.transform = 'rotate(0deg)';

        setTimeout(() => {
            navLinks.classList.remove('active');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }, 50);
    });
});

// 点击页面其他地方关闭菜单
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.menu-toggle') && navLinks.classList.contains('active')) {
        const icon = menuToggle.querySelector('i');
        icon.style.transform = 'rotate(0deg)';

        setTimeout(() => {
            navLinks.classList.remove('active');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }, 50);
    }
});

// 搜索功能
const searchBtn = document.querySelector('.search-btn');
const searchOverlay = document.querySelector('.search-overlay');
const searchClose = document.querySelector('.search-close');
const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');

// 存储所有可搜索的内容
let searchableContent = [];

// 初始化搜索内容
function initSearchContent() {
    // 获取Hero section内容
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const subtitle = heroSection.querySelector('.hero-subtitle');
        if (subtitle) {
            searchableContent.push({
                type: '简介',
                title: 'About YangYang',
                description: subtitle.textContent,
                element: heroSection,
                link: '#about'
            });
        }
    }

    // 获取发表论文内容
    document.querySelectorAll('.publication-card').forEach(publication => {
        const title = publication.querySelector('h3').textContent;
        const authors = publication.querySelector('.authors')?.textContent || '';
        const venue = publication.querySelector('.venue')?.textContent || '';
        const description = publication.querySelector('.description')?.textContent || '';
        searchableContent.push({
            type: '论文',
            title,
            description: `${authors} ${venue} ${description}`.trim(),
            element: publication,
            link: '#publications'
        });
    });

    // 获取演讲内容
    document.querySelectorAll('.talk-card').forEach(talk => {
        const title = talk.querySelector('h3').textContent;
        const time = talk.querySelector('.talk-time span')?.textContent || '';
        const location = talk.querySelector('.talk-location span')?.textContent || '';
        const description = talk.querySelector('.talk-description')?.textContent || '';
        searchableContent.push({
            type: '演讲',
            title,
            description: `${time} ${location} ${description}`.trim(),
            element: talk,
            link: '#talks'
        });
    });

    // 获取技术栈内容
    document.querySelectorAll('.tech-category').forEach(category => {
        const title = category.querySelector('h3').textContent;
        const items = Array.from(category.querySelectorAll('.tech-item span'))
            .map(span => span.textContent.trim());
        searchableContent.push({
            type: '技能',
            title,
            description: items.join('、'),
            element: category,
            link: '#tech-stack'
        });
    });

    // 获取项目内容
    document.querySelectorAll('.project-card').forEach(project => {
        const title = project.querySelector('h3').textContent;
        const description = project.querySelector('p').textContent;
        searchableContent.push({
            type: '研究项目',
            title,
            description,
            element: project,
            link: '#projects'
        });
    });

    // 获取经历内容
    document.querySelectorAll('.timeline-item').forEach(item => {
        const title = item.querySelector('h4').textContent;
        const description = item.querySelector('.description')?.textContent || '';
        const institution = item.querySelector('.institution')?.textContent || '';
        searchableContent.push({
            type: '教育经历',
            title,
            description: `${institution} ${description}`.trim(),
            element: item,
            link: '#experience'
        });
    });

    // 获取兴趣标签
    const interestTags = document.querySelectorAll('.interest-tag');
    if (interestTags.length > 0) {
        const interests = Array.from(interestTags).map(tag => tag.textContent.trim());
        searchableContent.push({
            type: '兴趣',
            title: '研究兴趣',
            description: interests.join('、'),
            element: document.querySelector('.beyond-code'),
            link: '#about'
        });
    }
}

// 执行搜索
function performSearch(query) {
    query = query.toLowerCase().trim();

    if (!query) {
        searchResults.innerHTML = '<div class="no-results">请输入搜索关键词</div>';
        return;
    }

    const results = searchableContent.filter(item => {
        const searchText = `${item.title} ${item.description}`.toLowerCase();
        return searchText.includes(query);
    });

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">未找到相关内容</div>';
        return;
    }

    const resultsHtml = results.map(result => {
        const highlightedTitle = highlightText(result.title, query);
        const highlightedDesc = highlightText(result.description, query);

        return `
                    <a href="${result.link}" class="search-result-item" data-type="${result.type}">
                        <span class="result-type">${result.type}</span>
                        <h3>${highlightedTitle}</h3>
                        <p>${highlightedDesc}</p>
                    </a>
                `;
    }).join('');

    searchResults.innerHTML = resultsHtml;

    // 为搜索结果添加点击事件
    document.querySelectorAll('.search-result-item').forEach((item, index) => {
        // 阻止默认的链接行为和样式
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        item.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });

        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const result = results[index];

            closeSearch();

            if (result.element) {
                // 移除所有现有的高亮效果
                document.querySelectorAll('.highlight-target').forEach(el => {
                    el.classList.remove('highlight-target');
                });

                // 添加高亮效果
                result.element.classList.add('highlight-target');

                // 滚动到目标位置
                result.element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                // 3秒后移除高亮效果
                setTimeout(() => {
                    result.element.classList.remove('highlight-target');
                }, 3000);
            } else if (result.link.startsWith('#')) {
                const targetElement = document.querySelector(result.link);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = result.link;
            }
        });
    });
}

// 高亮搜索关键词
function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// 打开搜索
function openSearch() {
    searchOverlay.style.display = 'flex';
    // 强制重绘以确保 display 属性生效
    searchOverlay.offsetHeight;
    searchOverlay.classList.add('active');
    setTimeout(() => {
        searchInput.focus();
    }, 100);
    document.body.style.overflow = 'hidden';
}

// 关闭搜索
function closeSearch() {
    searchOverlay.classList.remove('active');
    setTimeout(() => {
        searchOverlay.style.display = 'none';
        searchInput.value = '';
        searchResults.innerHTML = '';
    }, 300);
    document.body.style.overflow = '';
}

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

// 复制引用文献功能
async function copyBibTeX(citationId) {
    try {
        const response = await fetch(`citation/${citationId}`);
        const text = await response.text();
        await navigator.clipboard.writeText(text);

        // 显示提示信息
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '参考文献已复制到剪贴板';
        tooltip.style.position = 'fixed';
        tooltip.style.top = '20px';
        tooltip.style.right = '20px';
        tooltip.style.padding = '10px 20px';
        tooltip.style.backgroundColor = '#4CAF50';
        tooltip.style.color = 'white';
        tooltip.style.borderRadius = '4px';
        tooltip.style.zIndex = '1000';
        document.body.appendChild(tooltip);

        // 2秒后移除提示
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    } catch (err) {
        // 显示错误提示
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.top = '20px';
        tooltip.style.right = '20px';
        tooltip.style.padding = '10px 20px';
        tooltip.style.backgroundColor = '#dc3545';  // 错误时使用红色背景
        tooltip.style.color = 'white';
        tooltip.style.borderRadius = '4px';
        tooltip.style.zIndex = '1000';
        tooltip.textContent = '复制失败，请重试';
        document.body.appendChild(tooltip);

        setTimeout(() => {
            tooltip.remove();
        }, 2000);

        console.error('复制失败:', err);
    }
}

function copyToClipboard(text) {
    // 创建一个临时文本区域
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    // 检查是否是iOS设备（包括Safari）
    const isIOS = navigator.userAgent.match(/ipad|iphone/i);

    if (isIOS) {
        // iOS设备特殊处理
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textarea.setSelectionRange(0, text.length);
    } else {
        // 其他设备
        textarea.select();
    }

    let successful = false;
    try {
        // 尝试执行复制命令
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('无法复制文本: ', err);
    }

    // 移除临时文本区域
    document.body.removeChild(textarea);

    // 显示复制成功/失败的提示
    showCopyFeedback(successful);
}

function showCopyFeedback(successful) {
    // 创建提示元素
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = successful ? '已复制到剪贴板！' : '复制失败，请手动复制';
    feedback.style.position = 'fixed';
    feedback.style.top = '20px'; // 改为顶部
    feedback.style.right = '20px'; // 改为右侧
    feedback.style.transform = 'none'; // 移除左侧的转换
    feedback.style.padding = '10px 20px';
    feedback.style.backgroundColor = successful ? '#4CAF50' : '#F44336';
    feedback.style.color = 'white';
    feedback.style.borderRadius = '4px';
    feedback.style.zIndex = '1000';

    document.body.appendChild(feedback);

    // 2秒后移除提示
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 2000);
}
