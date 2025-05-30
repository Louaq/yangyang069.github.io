// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始创建返回顶部按钮');
    
    // 创建按钮元素
    var backToTopBtn = document.createElement('button');
    backToTopBtn.id = 'scrollToTopBtn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', '返回顶部');
    
    // 添加样式
    backToTopBtn.style.position = 'fixed';
    backToTopBtn.style.bottom = '30px';
    backToTopBtn.style.right = '30px';
    backToTopBtn.style.width = '50px';
    backToTopBtn.style.height = '50px';
    backToTopBtn.style.borderRadius = '50%';
    backToTopBtn.style.border = 'none';
    backToTopBtn.style.backgroundColor = '#00ffff';
    backToTopBtn.style.color = '#0a0a0a';
    backToTopBtn.style.fontSize = '16px';
    backToTopBtn.style.cursor = 'pointer';
    backToTopBtn.style.display = 'flex';
    backToTopBtn.style.alignItems = 'center';
    backToTopBtn.style.justifyContent = 'center';
    backToTopBtn.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    backToTopBtn.style.zIndex = '10000';
    backToTopBtn.style.opacity = '0';
    backToTopBtn.style.visibility = 'hidden';
    backToTopBtn.style.transition = 'all 0.3s ease';
    
    // 添加按钮到body
    document.body.appendChild(backToTopBtn);
    
    console.log('按钮已添加到DOM');
    
    // 悬停效果
    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#00ff88'; // 变为绿色
        this.style.transform = 'translateY(-5px)'; // 上移效果
        this.style.boxShadow = '0 8px 15px rgba(0, 255, 255, 0.5)'; // 增强阴影
    });
    
    backToTopBtn.addEventListener('mouseleave', function() {
        var theme = document.documentElement.getAttribute('data-theme');
        this.style.backgroundColor = theme === 'light' ? '#0099cc' : '#00ffff';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    });
    
    // 点击事件 - 滚动到顶部
    backToTopBtn.addEventListener('click', function() {
        console.log('按钮被点击');
        
        // 点击反馈效果
        this.style.transform = 'scale(0.95)';
        this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        
        // 滚动到顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 恢复样式
        setTimeout(() => {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        }, 200);
    });
    
    // 添加滚动事件监听
    window.addEventListener('scroll', function() {
        var scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        if (scrollPosition > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // 适配浅色模式
    function updateButtonTheme() {
        var theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            backToTopBtn.style.backgroundColor = '#0099cc';
        } else {
            backToTopBtn.style.backgroundColor = '#00ffff';
        }
    }
    
    // 初始化主题
    updateButtonTheme();
    
    // 监听主题变化
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                updateButtonTheme();
            }
        });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    // 移动设备适配
    function adjustForMobile() {
        if (window.innerWidth <= 768) {
            backToTopBtn.style.width = '40px';
            backToTopBtn.style.height = '40px';
            backToTopBtn.style.bottom = '20px';
            backToTopBtn.style.right = '20px';
            backToTopBtn.style.fontSize = '14px';
        } else {
            backToTopBtn.style.width = '50px';
            backToTopBtn.style.height = '50px';
            backToTopBtn.style.bottom = '30px';
            backToTopBtn.style.right = '30px';
            backToTopBtn.style.fontSize = '16px';
        }
    }
    
    // 初始调整
    adjustForMobile();
    
    // 监听窗口大小变化
    window.addEventListener('resize', adjustForMobile);
    
    // 立即检查是否需要显示按钮
    var initialScroll = window.scrollY || document.documentElement.scrollTop;
    if (initialScroll > 300) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
    }
    
    console.log('返回顶部按钮初始化完成');
}); 