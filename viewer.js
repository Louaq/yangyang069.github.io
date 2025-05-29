// PDF查看器主类
class PDFViewer {
    constructor() {
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.0;
        this.defaultScale = 1.0;
        this.minScale = 0.25;
        this.maxScale = 5.0;
        this.scaleStep = 0.25;
        this.canvas = null;
        this.ctx = null;
        this.rendering = false;
        this.pageRotation = 0;
        
        // URL参数
        this.urlParams = new URLSearchParams(window.location.search);
        this.pdfUrl = this.urlParams.get('pdf') || 'pdf/slides.pdf';
        this.title = this.urlParams.get('title') || '幻灯片';
        
        // 初始化
        this.init();
    }

    async init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupTheme();
        await this.loadPDF();
    }

    setupElements() {
        // 获取主要元素
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.pageNumberInput = document.getElementById('pageNumber');
        this.totalPagesSpan = document.getElementById('totalPages');
        this.zoomLevelSpan = document.getElementById('zoomLevel');
        this.presentationTitle = document.getElementById('presentationTitle');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.viewerContainer = document.getElementById('viewerContainer');
        this.sidebar = document.getElementById('sidebar');
        this.thumbnailsContainer = document.getElementById('thumbnailsContainer');

        // 设置标题
        this.presentationTitle.textContent = this.title;
        document.title = `${this.title} - 幻灯片查看器`;
        
        // 默认显示侧边栏
        this.sidebar.classList.add('open');
    }

    setupEventListeners() {
        // 导航按钮
        document.getElementById('prevBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        
        // 缩放按钮
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('fitPageBtn').addEventListener('click', () => this.fitToPage());
        
        // 全屏按钮
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        
        // 页码输入
        this.pageNumberInput.addEventListener('change', (e) => {
            const pageNum = parseInt(e.target.value);
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.goToPage(pageNum);
            } else {
                e.target.value = this.currentPage;
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // 鼠标滚轮翻页
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // 为整个PDF容器添加滚轮事件
        document.getElementById('pdfContainer').addEventListener('wheel', (e) => this.handleWheel(e));

        // 触摸手势
        this.setupTouchGestures();

        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());

        // 全屏变化
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    }

    setupTheme() {
        // 检查系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark && !document.documentElement.getAttribute('data-theme')) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // 监听主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!document.documentElement.getAttribute('data-theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }

    async loadPDF() {
        try {
            // 设置PDF.js worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            // 加载PDF
            const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
            this.pdfDoc = await loadingTask.promise;
            
            this.totalPages = this.pdfDoc.numPages;
            this.totalPagesSpan.textContent = this.totalPages;

            // 先获取第一页来计算尺寸
            const firstPage = await this.pdfDoc.getPage(1);
            const initialViewport = firstPage.getViewport({ scale: 1.0 });
            
            // 设置初始canvas尺寸以计算缩放
            this.canvas.width = initialViewport.width;
            this.canvas.height = initialViewport.height;
            
            // 在第一次渲染之前计算正确的缩放比例，不重新渲染
            this.calculateDefaultScale(false);

            // 隐藏加载指示器
            this.loadingIndicator.style.display = 'none';
            this.viewerContainer.classList.add('loaded');

            // 使用正确的缩放比例渲染第一页
            await this.renderPage(1);
            
            // 异步生成缩略图，不影响主页面显示
            setTimeout(() => {
                this.generateThumbnails();
            }, 100);

        } catch (error) {
            console.error('加载PDF失败:', error);
            this.showError('无法加载PDF文件');
        }
    }

    async renderPage(pageNum, animation = '') {
        if (this.rendering || !this.pdfDoc) return;

        this.rendering = true;
        this.currentPage = pageNum;
        this.pageNumberInput.value = pageNum;

        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale, rotation: this.pageRotation });

            // 设置canvas尺寸
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;

            // 添加平滑过渡动画
            if (animation) {
                this.canvas.style.opacity = '0';
                if (animation === 'next') {
                    this.canvas.style.transform = 'translateY(-20px)';
                } else if (animation === 'prev') {
                    this.canvas.style.transform = 'translateY(20px)';
                } else if (animation === 'zoom') {
                    this.canvas.style.transform = 'scale(0.95)';
                }
            }

            // 渲染页面
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            // 应用动画效果
            if (animation) {
                // 强制重绘
                this.canvas.offsetHeight;
                
                // 开始动画
                this.canvas.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                this.canvas.style.opacity = '1';
                this.canvas.style.transform = 'translateY(0) scale(1)';
                
                // 清理样式
                setTimeout(() => {
                    this.canvas.style.transition = '';
                    this.canvas.style.transform = '';
                }, 300);
            }

            // 更新导航按钮状态
            this.updateNavigationButtons();
            
            // 更新缩略图激活状态
            this.updateThumbnailActive();

        } catch (error) {
            console.error('渲染页面失败:', error);
        } finally {
            this.rendering = false;
        }
    }

    async generateThumbnails() {
        if (!this.pdfDoc) return;

        this.thumbnailsContainer.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'thumbnail';
            thumbnailDiv.addEventListener('click', () => this.goToPage(i));

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            try {
                const page = await this.pdfDoc.getPage(i);
                // 大幅增加缩放比例以提高清晰度
                const thumbnailScale = 1.0; // 从0.5增加到1.0
                const viewport = page.getViewport({ scale: thumbnailScale });
                
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // 启用高质量渲染
                await page.render({
                    canvasContext: ctx,
                    viewport: viewport,
                    intent: 'display'
                }).promise;

                const label = document.createElement('div');
                label.className = 'thumbnail-label';
                label.textContent = `第 ${i} 页`;

                thumbnailDiv.appendChild(canvas);
                thumbnailDiv.appendChild(label);
                this.thumbnailsContainer.appendChild(thumbnailDiv);

            } catch (error) {
                console.error(`生成第${i}页缩略图失败:`, error);
            }
        }
    }

    calculateDefaultScale(shouldRerender = true) {
        if (!this.canvas.width || !this.canvas.height) return;

        const container = document.getElementById('pdfContainer');
        const containerWidth = container.clientWidth - 40; // 减去padding
        const containerHeight = container.clientHeight - 40;

        // 优先按高度适应界面
        const scaleByHeight = containerHeight / this.canvas.height;
        const scaleByWidth = containerWidth / this.canvas.width;
        
        // 优先使用高度缩放，但如果导致宽度超出容器，则使用宽度缩放
        let targetScale = scaleByHeight;
        const scaledWidth = this.canvas.width * scaleByHeight;
        
        if (scaledWidth > containerWidth) {
            // 如果按高度缩放后宽度超出，则使用宽度缩放
            targetScale = scaleByWidth;
        }
        
        // 限制最大缩放为设置的最大值，最小缩放为设置的最小值
        this.defaultScale = Math.max(this.minScale, Math.min(targetScale, this.maxScale));
        this.scale = this.defaultScale;
        this.updateZoomLevel();
        
        // 只有在需要时才重新渲染
        if (shouldRerender) {
            this.renderPage(this.currentPage);
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            await this.renderPage(this.currentPage - 1, 'prev');
        }
    }

    async nextPage() {
        if (this.currentPage < this.totalPages) {
            await this.renderPage(this.currentPage + 1, 'next');
        }
    }

    async goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages && pageNum !== this.currentPage) {
            const animation = pageNum > this.currentPage ? 'next' : 'prev';
            await this.renderPage(pageNum, animation);
        }
    }

    async zoomIn() {
        if (this.scale < this.maxScale) {
            this.scale = Math.min(this.scale + this.scaleStep, this.maxScale);
            this.updateZoomLevel();
            await this.renderPage(this.currentPage, 'zoom');
            
            // 检查是否达到最大缩放
            if (this.scale >= this.maxScale) {
                this.showZoomLimitMessage(`已达到最大缩放 ${Math.round(this.maxScale * 100)}%`);
            }
        } else {
            this.showZoomLimitMessage(`已达到最大缩放 ${Math.round(this.maxScale * 100)}%`);
        }
    }

    async zoomOut() {
        if (this.scale > this.minScale) {
            this.scale = Math.max(this.scale - this.scaleStep, this.minScale);
            this.updateZoomLevel();
            await this.renderPage(this.currentPage, 'zoom');
            
            // 检查是否达到最小缩放
            if (this.scale <= this.minScale) {
                this.showZoomLimitMessage(`已达到最小缩放 ${Math.round(this.minScale * 100)}%`);
            }
        } else {
            this.showZoomLimitMessage(`已达到最小缩放 ${Math.round(this.minScale * 100)}%`);
        }
    }

    async fitToPage() {
        // 重新计算并应用默认缩放
        this.calculateDefaultScale();
    }

    updateZoomLevel() {
        const percentage = Math.round(this.scale * 100);
        this.zoomLevelSpan.textContent = `${percentage}%`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === this.totalPages;
    }

    updateThumbnailActive() {
        const thumbnails = this.thumbnailsContainer.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index + 1 === this.currentPage);
        });
        
        // 滚动到当前页面缩略图
        const activeThumbnail = this.thumbnailsContainer.querySelector('.thumbnail.active');
        if (activeThumbnail) {
            activeThumbnail.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    handleFullscreenChange() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const icon = fullscreenBtn.querySelector('i');
        
        if (document.fullscreenElement) {
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = '退出全屏';
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = '全屏';
        }
    }

    handleKeydown(e) {
        // 防止在输入框中触发快捷键
        if (e.target.tagName === 'INPUT') return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.nextPage();
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.zoomIn();
                break;
            case '-':
                e.preventDefault();
                this.zoomOut();
                break;
            case '0':
                e.preventDefault();
                this.fitToPage();
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    e.preventDefault();
                    document.exitFullscreen();
                }
                break;
            case '?':
                e.preventDefault();
                toggleHelp();
                break;
        }
    }

    handleWheel(e) {
        e.preventDefault();
        
        // 鼠标滚轮翻页
        if (e.deltaY > 0) {
            // 向下滚动，下一页
            this.nextPage();
        } else if (e.deltaY < 0) {
            // 向上滚动，上一页
            this.previousPage();
        }
    }

    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let initialScale = 1;
        let initialDistance = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                initialScale = this.scale;
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scaleChange = currentDistance / initialDistance;
                const newScale = initialScale * scaleChange;
                
                // 确保缩放在允许范围内
                const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
                
                if (Math.abs(clampedScale - this.scale) > 0.05) {
                    this.scale = clampedScale;
                    this.updateZoomLevel();
                    this.renderPage(this.currentPage);
                }
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1 && e.touches.length === 0) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                
                // 垂直滑动检测（改为垂直滑动翻页）
                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
                    if (deltaY > 0) {
                        this.previousPage();
                    } else {
                        this.nextPage();
                    }
                }
            }
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleResize() {
        // 延迟执行以避免频繁调用
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // 重新计算默认缩放并应用
            this.calculateDefaultScale();
        }, 300);
    }

    showError(message) {
        this.loadingIndicator.innerHTML = `
            <div style="color: var(--danger-color); text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p style="font-size: 18px; font-weight: 500;">${message}</p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">重新加载</button>
            </div>
        `;
    }

    showZoomLimitMessage(message) {
        // 创建临时提示元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.style.opacity = '1', 10);
        
        // 2秒后移除
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }
}

// 帮助功能
function toggleHelp() {
    const helpOverlay = document.getElementById('helpOverlay');
    helpOverlay.classList.toggle('show');
}

// 当页面加载完成后初始化查看器
document.addEventListener('DOMContentLoaded', () => {
    window.pdfViewer = new PDFViewer();
});

// 防止右键菜单（可选）
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停渲染等操作
    } else {
        // 页面可见时恢复
        if (window.pdfViewer && window.pdfViewer.pdfDoc) {
            window.pdfViewer.handleResize();
        }
    }
});

// 在线状态检测
window.addEventListener('online', () => {
    console.log('网络连接已恢复');
});

window.addEventListener('offline', () => {
    console.log('网络连接已断开');
}); 