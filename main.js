// 主题切换功能
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// 检查本地存储中的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
} else {
    // 如果没有保存的主题，则使用系统主题
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
}

// 更新主题图标
function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// 切换主题
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

document.getElementById('current-year').textContent = new Date().getFullYear();

// 移动端菜单
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// 点击导航链接时关闭菜单
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// 点击页面其他地方关闭菜单
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links') && !e.target.closest('.menu-toggle')) {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
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
    // 获取个人简介内容
    const profileBio = document.querySelector('.profile-bio');
    if (profileBio) {
        searchableContent.push({
            type: '简介',
            title: '关于我',
            description: profileBio.querySelector('p').textContent,
            element: profileBio,
            link: '#'
        });
    }

    // 获取研究兴趣
    const researchInterests = document.querySelector('.research-interests');
    if (researchInterests) {
        const interests = Array.from(researchInterests.querySelectorAll('li'))
            .map(li => li.textContent.trim());
        searchableContent.push({
            type: '研究方向',
            title: '研究兴趣',
            description: interests.join('、'),
            element: researchInterests,
            link: '#'
        });
    }

    // 获取教育经历
    document.querySelectorAll('.education-item').forEach(edu => {
        const title = edu.querySelector('h3').textContent;
        const description = edu.querySelector('p').textContent;
        searchableContent.push({
            type: '教育经历',
            title,
            description,
            element: edu,
            link: '#about'
        });
    });

    // 获取文章内容
    document.querySelectorAll('.post-card').forEach(post => {
        const title = post.querySelector('h3 a').textContent;
        const description = Array.from(post.querySelectorAll('p'))
            .map(p => p.textContent)
            .join(' ');
        const link = post.querySelector('h3 a').href;
        searchableContent.push({
            type: '文章',
            title,
            description,
            element: post,
            link: link || '#posts'
        });
    });

    // 获取演讲内容
    document.querySelectorAll('.talk-card').forEach(talk => {
        const title = talk.querySelector('h3').textContent;
        const description = talk.querySelector('p').textContent;
        searchableContent.push({
            type: '演讲',
            title,
            description,
            element: talk,
            link: '#talks'
        });
    });

    // 获取经历内容
    document.querySelectorAll('.experience-item').forEach(exp => {
        const title = exp.querySelector('h3').textContent;
        const description = exp.querySelector('.experience-description')?.textContent || '';
        const date = exp.querySelector('.experience-date')?.textContent || '';
        searchableContent.push({
            type: '经历',
            title,
            description: `${date} ${description}`.trim(),
            element: exp,
            link: '#experiences'
        });
    });
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
        item.addEventListener('click', (e) => {
            e.preventDefault();
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
    searchOverlay.classList.add('active');
    searchInput.focus();
    document.body.style.overflow = 'hidden';
}

// 关闭搜索
function closeSearch() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
    document.body.style.overflow = '';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initSearchContent();

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', openSearch);

    // 关闭按钮点击事件
    searchClose.addEventListener('click', closeSearch);

    // 搜索输入事件
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    // ESC键关闭搜索
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    // 点击遮罩层关闭搜索
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });

    // 回到顶部按钮逻辑
    const backToTopButton = document.querySelector('.back-to-top');

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

    // 添加兼容Safari的剪贴板功能
    const citationButtons = document.querySelectorAll('.citation-btn');
    
    citationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bibtex = this.getAttribute('data-bibtex');
            copyToClipboard(bibtex);
        });
    });
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
