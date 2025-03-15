// 存储所有可搜索的内容
let searchableContent = [];

// 初始化搜索功能
function initSearch() {
    // 获取所有文章内容
    const posts = document.querySelectorAll('.post-card');
    posts.forEach(post => {
        const title = post.querySelector('h3').textContent;
        const description = post.querySelector('p').textContent;
        const tags = Array.from(post.querySelectorAll('.tag')).map(tag => tag.textContent);
        const link = post.querySelector('h3 a').href;
        
        searchableContent.push({
            type: 'post',
            title,
            description,
            tags,
            link,
            element: post
        });
    });

    // 获取所有演讲内容
    const talks = document.querySelectorAll('.talk-card');
    talks.forEach(talk => {
        const title = talk.querySelector('h3').textContent;
        const description = talk.querySelector('p').textContent;
        const link = talk.querySelector('h3 a')?.href || '';
        
        searchableContent.push({
            type: 'talk',
            title,
            description,
            link,
            element: talk
        });
    });

    // 获取所有经历内容
    const experiences = document.querySelectorAll('.experience-content');
    experiences.forEach(exp => {
        const title = exp.querySelector('h3').textContent;
        const description = exp.querySelector('.experience-description').textContent;
        
        searchableContent.push({
            type: 'experience',
            title,
            description,
            element: exp
        });
    });
}

// 搜索功能
function performSearch(query) {
    query = query.toLowerCase().trim();
    const searchResults = document.querySelector('.search-results');
    searchResults.innerHTML = '';

    if (!query) {
        searchResults.innerHTML = '<div class="no-results">请输入搜索关键词</div>';
        return;
    }

    const results = searchableContent.filter(item => {
        return item.title.toLowerCase().includes(query) ||
               item.description.toLowerCase().includes(query) ||
               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
    });

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">未找到相关内容</div>';
        return;
    }

    results.forEach(result => {
        const resultElement = document.createElement('a');
        resultElement.className = 'search-result-item';
        resultElement.href = result.link || '#';

        const typeText = {
            'post': '文章',
            'talk': '演讲',
            'experience': '经历'
        }[result.type];

        resultElement.innerHTML = `
            <span class="result-type">${typeText}</span>
            <h3>${highlightText(result.title, query)}</h3>
            <p>${highlightText(result.description, query)}</p>
            ${result.tags ? `
                <div class="result-tags">
                    ${result.tags.map(tag => `<span class="tag">${highlightText(tag, query)}</span>`).join('')}
                </div>
            ` : ''}
        `;

        resultElement.addEventListener('click', (e) => {
            if (!result.link) {
                e.preventDefault();
                closeSearch();
                result.element.scrollIntoView({ behavior: 'smooth' });
                result.element.classList.add('highlight-target');
                setTimeout(() => result.element.classList.remove('highlight-target'), 2000);
            }
        });

        searchResults.appendChild(resultElement);
    });
}

// 高亮搜索关键词
function highlightText(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// 打开搜索框
function openSearch() {
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input');
    searchOverlay.classList.add('active');
    searchInput.focus();
    document.body.style.overflow = 'hidden';
}

// 关闭搜索框
function closeSearch() {
    const searchOverlay = document.querySelector('.search-overlay');
    searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
    document.querySelector('.search-input').value = '';
    document.querySelector('.search-results').innerHTML = '';
}

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    initSearch();

    // 搜索按钮点击事件
    document.querySelector('.search-btn').addEventListener('click', openSearch);

    // 关闭按钮点击事件
    document.querySelector('.search-close').addEventListener('click', closeSearch);

    // 搜索输入事件
    document.querySelector('.search-input').addEventListener('input', (e) => {
        performSearch(e.target.value);
    });

    // ESC键关闭搜索
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // 点击遮罩层关闭搜索
    document.querySelector('.search-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('search-overlay')) {
            closeSearch();
        }
    });
}); 