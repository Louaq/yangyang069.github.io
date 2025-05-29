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
        this.isScrollMode = true; // 默认使用连续滚动模式
        this.pageCanvases = []; // 存储所有页面的canvas
        this.pageGap = 20; // 页面之间的间距
        this.visiblePages = new Set(); // 当前可见的页面
        this.renderQueue = []; // 渲染队列
        this.isRendering = false; // 是否正在渲染
        this.isMobileDevice = window.innerWidth <= 768; // 是否为移动设备
        
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
        this.setupMobileDetection();
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
        this.pdfContainer = document.getElementById('pdfContainer');
        
        // 创建侧边栏调整器
        this.createSidebarResizer();
        
        // 创建连续滚动容器
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'pdf-scroll-container';
        this.pdfContainer.appendChild(this.scrollContainer);
        
        // 隐藏单页模式的canvas
        this.canvas.style.display = 'none';

        // 设置标题
        this.presentationTitle.textContent = this.title;
        document.title = `${this.title} - 幻灯片查看器`;
        
        // 默认显示侧边栏
        this.sidebar.classList.add('open');
        
        // 创建侧边栏切换按钮
        this.createSidebarToggle();
    }

    // 创建侧边栏切换按钮
    createSidebarToggle() {
        // 创建切换按钮
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle';
        toggleBtn.title = '切换侧边栏';
        
        // 根据设备类型设置不同图标
        if (this.isMobileDevice) {
            toggleBtn.innerHTML = '<span>页面导航</span> <i class="fas fa-chevron-up"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        }
        
        // 添加到工具栏左侧（桌面版）或body（移动版）
        if (this.isMobileDevice) {
            document.body.appendChild(toggleBtn);
        } else {
            const toolbarLeft = document.querySelector('.toolbar-left');
            toolbarLeft.insertBefore(toggleBtn, toolbarLeft.firstChild);
        }
        
        // 创建侧边栏遮罩层（用于移动设备）
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
        
        // 点击遮罩层关闭侧边栏
        overlay.addEventListener('click', () => {
            this.toggleSidebar(false);
        });
        
        // 添加点击事件
        toggleBtn.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // 恢复上次的侧边栏状态
        const sidebarVisible = localStorage.getItem('sidebarVisible');
        if (sidebarVisible === 'false') {
            this.toggleSidebar(false);
        }
    }
    
    // 切换侧边栏显示/隐藏
    toggleSidebar(show) {
        const isVisible = this.sidebar.classList.contains('open');
        const shouldShow = show !== undefined ? show : !isVisible;
        const overlay = document.querySelector('.sidebar-overlay');
        const toggleBtn = document.querySelector('.sidebar-toggle');
        
        if (shouldShow) {
            this.sidebar.classList.add('open');
            
            // 根据设备类型设置不同的按钮图标和位置
            if (this.isMobileDevice) {
                toggleBtn.innerHTML = '<span>关闭导航</span> <i class="fas fa-chevron-down"></i>';
            } else {
                toggleBtn.querySelector('i').className = 'fas fa-chevron-left';
            }
            
            // 在移动设备上显示遮罩层
            if (this.isMobileDevice && overlay) {
                overlay.classList.add('visible');
            }
        } else {
            this.sidebar.classList.remove('open');
            
            // 根据设备类型设置不同的按钮图标和位置
            if (this.isMobileDevice) {
                toggleBtn.innerHTML = '<span>页面导航</span> <i class="fas fa-chevron-up"></i>';
            } else {
                toggleBtn.querySelector('i').className = 'fas fa-chevron-right';
            }
            
            // 隐藏遮罩层
            if (overlay) {
                overlay.classList.remove('visible');
            }
        }
        
        // 保存状态到本地存储
        localStorage.setItem('sidebarVisible', shouldShow);
        
        // 重新计算默认缩放
        setTimeout(() => {
            if (this.pdfDoc) {
                this.calculateDefaultScale();
            }
        }, 300);
    }

    // 创建侧边栏宽度调整器
    createSidebarResizer() {
        // 创建调整器元素
        const resizer = document.createElement('div');
        resizer.className = 'sidebar-resizer';
        resizer.title = '调整侧边栏宽度';
        
        // 添加调整器到侧边栏
        this.sidebar.appendChild(resizer);
        
        // 侧边栏默认宽度
        const defaultWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
        let startX, startWidth;
        
        // 鼠标按下事件
        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startWidth = this.sidebar.offsetWidth;
            document.documentElement.classList.add('resizing-sidebar');
            
            // 添加鼠标移动和松开事件
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            // 阻止默认事件和冒泡
            e.preventDefault();
            e.stopPropagation();
        });
        
        // 鼠标移动处理函数
        const handleMouseMove = (e) => {
            // 计算新宽度
            const newWidth = startWidth + (e.clientX - startX);
            
            // 限制最小和最大宽度
            const minWidth = 200;
            const maxWidth = window.innerWidth * 0.5; // 最大为窗口宽度的50%
            
            if (newWidth >= minWidth && newWidth <= maxWidth) {
                // 更新侧边栏宽度
                this.sidebar.style.width = `${newWidth}px`;
                
                // 更新CSS变量以便其他组件使用
                document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
                
                // 调整后重新计算默认缩放
                if (this.pdfDoc) {
                    clearTimeout(this.resizeDebounce);
                    this.resizeDebounce = setTimeout(() => {
                        this.calculateDefaultScale();
                    }, 100);
                }
            }
        };
        
        // 鼠标松开处理函数
        const handleMouseUp = () => {
            document.documentElement.classList.remove('resizing-sidebar');
            
            // 移除临时事件监听器
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // 保存当前宽度到本地存储
            localStorage.setItem('sidebarWidth', this.sidebar.style.width);
            
            // 重新生成缩略图以适应新宽度
            if (this.pdfDoc) {
                this.generateThumbnails();
            }
        };
        
        // 从本地存储恢复侧边栏宽度
        const savedWidth = localStorage.getItem('sidebarWidth');
        if (savedWidth) {
            this.sidebar.style.width = savedWidth;
            document.documentElement.style.setProperty('--sidebar-width', savedWidth);
        }
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

        // 添加滚动监听
        this.pdfContainer.addEventListener('scroll', () => this.handleScroll());
        
        // 添加用户滚动检测
        this.setupUserScrollDetection();
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

    setupMobileDetection() {
        // 检测是否为移动设备
        this.isMobileDevice = window.innerWidth <= 768;
        
        // 在移动设备上添加特定标记
        if (this.isMobileDevice) {
            document.body.classList.add('mobile-device');
            
            // 添加移动端特有的缩略图导航条
            this.setupMobileThumbnailsBar();
            
            // 添加移动端特有的页面导航控制
            this.setupMobilePageNavigation();
        } else {
            document.body.classList.remove('mobile-device');
        }
        
        // 添加监听设备方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                const wasMobile = this.isMobileDevice;
                this.isMobileDevice = window.innerWidth <= 768;
                
                // 如果设备类型发生变化
                if (wasMobile !== this.isMobileDevice) {
                    if (this.isMobileDevice) {
                        document.body.classList.add('mobile-device');
                        this.setupMobileThumbnailsBar();
                        this.setupMobilePageNavigation();
                    } else {
                        document.body.classList.remove('mobile-device');
                        this.removeMobileControls();
                    }
                }
                
                this.handleResize();
            }, 300);
        });
    }
    
    // 设置移动端缩略图导航条
    setupMobileThumbnailsBar() {
        // 移除已有的导航条（如果存在）
        this.removeMobileThumbnailsBar();
        
        // 创建导航条
        const thumbnailsBar = document.createElement('div');
        thumbnailsBar.className = 'page-thumbnails-bar';
        
        // 确保有文档加载
        if (this.pdfDoc) {
            // 为每一页创建缩略图
            for (let i = 1; i <= this.totalPages; i++) {
                const thumbnailItem = document.createElement('div');
                thumbnailItem.className = 'thumbnail-item';
                if (i === this.currentPage) {
                    thumbnailItem.classList.add('active');
                }
                
                // 页码
                const pageNumber = document.createElement('span');
                pageNumber.className = 'thumbnail-page-number';
                pageNumber.textContent = i;
                thumbnailItem.appendChild(pageNumber);
                
                // 当前页指示器
                if (i === this.currentPage) {
                    const indicator = document.createElement('div');
                    indicator.className = 'current-thumbnail-indicator';
                    thumbnailItem.appendChild(indicator);
                }
                
                // 点击事件
                thumbnailItem.addEventListener('click', () => {
                    this.goToPage(i);
                });
                
                thumbnailsBar.appendChild(thumbnailItem);
            }
        }
        
        // 添加到文档
        document.body.appendChild(thumbnailsBar);
        
        // 滚动到当前页缩略图
        setTimeout(() => {
            this.scrollToCurrentThumbnail();
        }, 100);
        
        // 添加滚动监听，在滚动时隐藏导航控制
        this.setupScrollHideNavigation();
    }
    
    // 移除移动端缩略图导航条
    removeMobileThumbnailsBar() {
        const thumbnailsBar = document.querySelector('.page-thumbnails-bar');
        if (thumbnailsBar) {
            thumbnailsBar.remove();
        }
    }
    
    // 设置移动端页面导航控制
    setupMobilePageNavigation() {
        // 移除已有的导航控制（如果存在）
        this.removeMobilePageNavigation();
        
        // 创建导航控制容器
        const navControls = document.createElement('div');
        navControls.className = 'page-navigation-controls hide-on-scroll';
        
        // 上一页按钮
        const prevButton = document.createElement('button');
        prevButton.className = 'page-nav-button prev-button';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = this.currentPage <= 1;
        prevButton.addEventListener('click', () => this.previousPage());
        
        // 页码计数器
        const pageCounter = document.createElement('div');
        pageCounter.className = 'page-counter';
        pageCounter.textContent = `${this.currentPage} / ${this.totalPages}`;
        
        // 下一页按钮
        const nextButton = document.createElement('button');
        nextButton.className = 'page-nav-button next-button';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = this.currentPage >= this.totalPages;
        nextButton.addEventListener('click', () => this.nextPage());
        
        // 组合控制元素
        navControls.appendChild(prevButton);
        navControls.appendChild(pageCounter);
        navControls.appendChild(nextButton);
        
        // 添加到文档
        document.body.appendChild(navControls);
    }
    
    // 移除移动端页面导航控制
    removeMobilePageNavigation() {
        const navControls = document.querySelector('.page-navigation-controls');
        if (navControls) {
            navControls.remove();
        }
    }
    
    // 移除所有移动端控制
    removeMobileControls() {
        this.removeMobileThumbnailsBar();
        this.removeMobilePageNavigation();
    }
    
    // 滚动到当前页缩略图
    scrollToCurrentThumbnail() {
        const thumbnailsBar = document.querySelector('.page-thumbnails-bar');
        if (!thumbnailsBar) return;
        
        const currentThumbnail = thumbnailsBar.querySelector('.thumbnail-item.active');
        if (currentThumbnail) {
            // 计算滚动位置，使当前缩略图居中
            const barWidth = thumbnailsBar.offsetWidth;
            const thumbLeft = currentThumbnail.offsetLeft;
            const thumbWidth = currentThumbnail.offsetWidth;
            const scrollLeft = thumbLeft - (barWidth / 2) + (thumbWidth / 2);
            
            thumbnailsBar.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }
    
    // 设置滚动时隐藏导航
    setupScrollHideNavigation() {
        let lastScrollTop = this.pdfContainer.scrollTop;
        let scrollTimeout;
        
        const hideControls = () => {
            const navControls = document.querySelector('.page-navigation-controls');
            if (navControls) {
                navControls.classList.add('hidden');
            }
        };
        
        const showControls = () => {
            const navControls = document.querySelector('.page-navigation-controls');
            if (navControls) {
                navControls.classList.remove('hidden');
            }
        };
        
        this.pdfContainer.addEventListener('scroll', () => {
            const scrollTop = this.pdfContainer.scrollTop;
            
            // 只在向下滚动时隐藏
            if (scrollTop > lastScrollTop) {
                hideControls();
            } else {
                showControls();
            }
            
            lastScrollTop = scrollTop;
            
            // 停止滚动一段时间后显示控制
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                showControls();
            }, 1000);
        });
    }

    async loadPDF() {
        try {
            // 设置PDF.js worker - 使用更稳定的CDN版本
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

            // 显示当前加载的PDF文件名
            const filename = this.pdfUrl.split('/').pop();
            console.log('正在加载PDF文件:', filename);
            
            // 在加载指示器中显示文件名
            const filenameElement = document.querySelector('.loading-filename');
            if (filenameElement) {
                filenameElement.textContent = filename;
            }
            
            // 检查PDF URL是否存在
            try {
                const response = await fetch(this.pdfUrl, { method: 'HEAD' });
                if (!response.ok) {
                    throw new Error(`PDF文件不存在或无法访问: ${response.status} ${response.statusText}`);
                }
            } catch (fetchError) {
                console.error('检查PDF文件时出错:', fetchError);
                throw new Error(`无法访问PDF文件: ${fetchError.message}`);
            }

            // 加载PDF
            const loadingTask = pdfjsLib.getDocument({
                url: this.pdfUrl,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/cmaps/',
                cMapPacked: true,
            });
            
            // 添加加载进度回调
            loadingTask.onProgress = (progress) => {
                if (progress && progress.loaded && progress.total) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    const loadingText = document.querySelector('#loadingIndicator p:not(.loading-filename)');
                    if (loadingText) {
                        loadingText.textContent = `正在加载PDF文件... ${percent}%`;
                    }
                }
            };
            
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

            // 处理文档加载完成
            await this.handleDocumentLoaded();

        } catch (error) {
            console.error('加载PDF失败:', error);
            this.showError(`无法加载PDF文件: ${error.message}`);
        }
    }

    async handleDocumentLoaded() {
        // 隐藏加载指示器
        this.loadingIndicator.style.display = 'none';
        this.viewerContainer.classList.add('loaded');

        // 使用连续滚动模式渲染所有页面
        await this.initializeScrollMode();
        
        // 如果是移动设备，设置移动端专用导航
        if (this.isMobileDevice) {
            this.setupMobileThumbnailsBar();
            this.setupMobilePageNavigation();
        } else {
            // 在桌面端，生成传统缩略图
            setTimeout(() => {
                this.generateThumbnails();
            }, 100);
        }
    }

    async initializeScrollMode() {
        this.scrollContainer.innerHTML = ''; // 清空容器
        this.pageCanvases = [];
        
        // 预创建所有页面的容器，但暂不渲染内容
        for (let i = 1; i <= this.totalPages; i++) {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page-container';
            pageContainer.dataset.pageNumber = i;
            pageContainer.id = `page-container-${i}`;
            
            // 设置页面容器高度占位，避免滚动条跳动
            // 先使用第一页的尺寸作为估计
            if (i === 1) {
                const page = await this.pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: this.scale });
                pageContainer.style.width = `${viewport.width}px`;
                pageContainer.style.height = `${viewport.height}px`;
            } else {
                // 其他页面暂时使用第一页的尺寸作为估计
                pageContainer.style.width = `${this.scrollContainer.firstChild.style.width}`;
                pageContainer.style.height = `${this.scrollContainer.firstChild.style.height}`;
            }
            
            // 添加页码指示
            const pageLabel = document.createElement('div');
            pageLabel.className = 'page-label';
            pageLabel.textContent = `${i} / ${this.totalPages}`;
            pageContainer.appendChild(pageLabel);
            
            // 添加到滚动容器
            this.scrollContainer.appendChild(pageContainer);
            
            // 将容器添加到数组
            this.pageCanvases.push({
                container: pageContainer,
                rendered: false
            });
        }
        
        // 初始化时仅渲染可见区域的页面
        setTimeout(() => this.handleScroll(), 100);
    }
    
    async renderPageInScrollMode(pageNum) {
        if (!this.pdfDoc || pageNum < 1 || pageNum > this.totalPages) return;
        
        // 获取页面容器
        const pageData = this.pageCanvases[pageNum - 1];
        if (pageData.rendered) return; // 已渲染则跳过
        
        try {
            const container = pageData.container;
            
            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';
            
            // 渲染页面
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale, rotation: this.pageRotation });
            
            // 设置canvas尺寸
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // 更新容器尺寸
            container.style.width = `${viewport.width}px`;
            container.style.height = `${viewport.height}px`;
            
            // 放入容器
            container.innerHTML = ''; // 清空之前的内容
            container.appendChild(canvas);
            
            // 添加页码指示
            const pageLabel = document.createElement('div');
            pageLabel.className = 'page-label';
            pageLabel.textContent = `${pageNum} / ${this.totalPages}`;
            container.appendChild(pageLabel);
            
            // 渲染内容
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // 标记为已渲染
            pageData.rendered = true;
            
            // 更新当前页码
            if (this.isPageVisible(pageNum)) {
                this.updateCurrentPage(pageNum);
            }
            
        } catch (error) {
            console.error(`渲染页面 ${pageNum} 失败:`, error);
        }
    }
    
    // 检查页面是否在可见区域内
    isPageVisible(pageNum) {
        const container = this.pageCanvases[pageNum - 1].container;
        const rect = container.getBoundingClientRect();
        const pdfContainerRect = this.pdfContainer.getBoundingClientRect();
        
        // 页面顶部在可视区域内或页面底部在可视区域内
        return (
            (rect.top >= pdfContainerRect.top && rect.top <= pdfContainerRect.bottom) ||
            (rect.bottom >= pdfContainerRect.top && rect.bottom <= pdfContainerRect.bottom) ||
            (rect.top <= pdfContainerRect.top && rect.bottom >= pdfContainerRect.bottom)
        );
    }
    
    // 处理滚动事件
    handleScroll() {
        // 优化：使用防抖处理滚动事件
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        
        this.scrollTimeout = setTimeout(() => {
            // 获取当前可见的页面
            const visiblePages = new Set();
            
            for (let i = 1; i <= this.totalPages; i++) {
                if (this.isPageVisible(i)) {
                    visiblePages.add(i);
                    // 将可见但未渲染的页面加入渲染队列
                    if (!this.pageCanvases[i - 1].rendered) {
                        this.addToRenderQueue(i);
                    }
                }
            }
            
            // 更新当前可见页面集合
            this.visiblePages = visiblePages;
            
            // 处理渲染队列
            this.processRenderQueue();
            
            // 更新当前页码为可见页面中的第一个
            if (visiblePages.size > 0) {
                const currentPage = Math.min(...visiblePages);
                this.updateCurrentPage(currentPage);
            }
        }, 100);
    }
    
    // 更新当前页码显示
    updateCurrentPage(pageNum) {
        if (pageNum === this.currentPage) return;
        
        this.currentPage = pageNum;
        this.pageNumberInput.value = pageNum;
        
        // 更新导航按钮状态
        this.updateNavigationButtons();
        
        // 更新缩略图激活状态
        this.updateThumbnailActive();
        
        // 更新移动端导航
        if (this.isMobileDevice) {
            this.updateMobileNavigation();
        }
    }
    
    // 更新移动端导航
    updateMobileNavigation() {
        // 更新导航条上的活动缩略图
        const thumbnailsBar = document.querySelector('.page-thumbnails-bar');
        if (thumbnailsBar) {
            const thumbnails = thumbnailsBar.querySelectorAll('.thumbnail-item');
            thumbnails.forEach((thumbnail, index) => {
                const pageNum = index + 1;
                if (pageNum === this.currentPage) {
                    thumbnail.classList.add('active');
                    
                    // 添加当前页指示器
                    if (!thumbnail.querySelector('.current-thumbnail-indicator')) {
                        const indicator = document.createElement('div');
                        indicator.className = 'current-thumbnail-indicator';
                        thumbnail.appendChild(indicator);
                    }
                } else {
                    thumbnail.classList.remove('active');
                    
                    // 移除非当前页的指示器
                    const indicator = thumbnail.querySelector('.current-thumbnail-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                }
            });
            
            // 滚动到当前缩略图
            this.scrollToCurrentThumbnail();
        }
        
        // 更新导航控制
        const navControls = document.querySelector('.page-navigation-controls');
        if (navControls) {
            // 更新页码计数
            const pageCounter = navControls.querySelector('.page-counter');
            if (pageCounter) {
                pageCounter.textContent = `${this.currentPage} / ${this.totalPages}`;
            }
            
            // 更新按钮状态
            const prevButton = navControls.querySelector('.prev-button');
            if (prevButton) {
                prevButton.disabled = this.currentPage <= 1;
            }
            
            const nextButton = navControls.querySelector('.next-button');
            if (nextButton) {
                nextButton.disabled = this.currentPage >= this.totalPages;
            }
        }
    }

    // 添加到渲染队列
    addToRenderQueue(pageNum) {
        // 检查是否已在队列中
        if (!this.renderQueue.includes(pageNum)) {
            this.renderQueue.push(pageNum);
        }
    }
    
    // 处理渲染队列
    async processRenderQueue() {
        if (this.isRendering || this.renderQueue.length === 0) return;
        
        this.isRendering = true;
        
        try {
            // 先渲染可见区域内的页面
            const visiblePages = [...this.visiblePages].filter(
                pageNum => !this.pageCanvases[pageNum - 1].rendered
            );
            
            // 处理可见页面
            for (const pageNum of visiblePages) {
                await this.renderPageInScrollMode(pageNum);
                this.renderQueue = this.renderQueue.filter(p => p !== pageNum);
            }
            
            // 再处理队列中的其他页面
            if (this.renderQueue.length > 0) {
                const pageNum = this.renderQueue.shift();
                await this.renderPageInScrollMode(pageNum);
            }
        } finally {
            this.isRendering = false;
            
            // 如果队列中还有任务，继续处理
            if (this.renderQueue.length > 0) {
                this.processRenderQueue();
            }
        }
    }

    // 单页模式渲染函数，继续保留以支持缩略图等功能
    async renderPage(pageNum, animation = '') {
        if (this.rendering || !this.pdfDoc) return;

        // 如果是滚动模式，则滚动到指定页面
        if (this.isScrollMode) {
            this.scrollToPage(pageNum);
            return;
        }

        this.rendering = true;
        this.currentPage = pageNum;
        this.pageNumberInput.value = pageNum;

        try {
            const page = await this.pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: this.scale, rotation: this.pageRotation });

            // 设置canvas尺寸
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;

            // 修改过渡动画：使用连续无缝过渡
            if (animation) {
                this.canvas.style.opacity = '0.9';
                if (animation === 'next') {
                    this.canvas.style.transform = 'translateY(-10px)';
                } else if (animation === 'prev') {
                    this.canvas.style.transform = 'translateY(10px)';
                } else if (animation === 'zoom') {
                    this.canvas.style.transform = 'scale(0.97)';
                }
            }

            // 渲染页面
            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            // 应用连续平滑过渡效果
            if (animation) {
                // 强制重绘
                this.canvas.offsetHeight;
                
                // 改为更平滑的过渡动画
                this.canvas.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                this.canvas.style.opacity = '1';
                this.canvas.style.transform = 'translateY(0) scale(1)';
                
                // 清理样式
                setTimeout(() => {
                    this.canvas.style.transition = '';
                    this.canvas.style.transform = '';
                }, 250);
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

    // 滚动到指定页面
    scrollToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) return;
        
        const container = this.pageCanvases[pageNum - 1].container;
        
        // 滚动到指定页面
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 更新当前页码
        this.updateCurrentPage(pageNum);
        
        // 确保页面已渲染
        if (!this.pageCanvases[pageNum - 1].rendered) {
            this.addToRenderQueue(pageNum);
            this.processRenderQueue();
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            const prevPage = this.currentPage - 1;
            
            if (this.isScrollMode) {
                this.scrollToPage(prevPage);
            } else {
                await this.renderPage(prevPage, 'prev');
            }
        }
    }

    async nextPage() {
        if (this.currentPage < this.totalPages) {
            const nextPage = this.currentPage + 1;
            
            if (this.isScrollMode) {
                this.scrollToPage(nextPage);
            } else {
                await this.renderPage(nextPage, 'next');
            }
        }
    }

    async goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages && pageNum !== this.currentPage) {
            if (this.isScrollMode) {
                this.scrollToPage(pageNum);
            } else {
                const animation = pageNum > this.currentPage ? 'next' : 'prev';
                await this.renderPage(pageNum, animation);
            }
            
            // 在移动设备上，如果侧边栏是打开的，则自动关闭
            if (this.isMobileDevice && this.sidebar.classList.contains('open')) {
                setTimeout(() => {
                    this.toggleSidebar(false);
                }, 300);
            }
        }
    }

    // 设置用户滚动检测
    setupUserScrollDetection() {
        let userScrolling = false;
        let scrollTimeout;
        
        // 监听用户滚动开始事件
        this.pdfContainer.addEventListener('wheel', () => {
            // 添加用户滚动标记类以启用平滑滚动
            if (!userScrolling) {
                userScrolling = true;
                this.pdfContainer.classList.add('user-scrolling');
            }
            
            // 清除之前的定时器
            clearTimeout(scrollTimeout);
            
            // 设置新的定时器，滚动停止后移除平滑滚动
            scrollTimeout = setTimeout(() => {
                userScrolling = false;
                this.pdfContainer.classList.remove('user-scrolling');
            }, 1000); // 1秒后认为用户停止滚动
        });
        
        // 监听触摸滚动
        this.pdfContainer.addEventListener('touchstart', () => {
            userScrolling = true;
            this.pdfContainer.classList.add('user-scrolling');
            
            clearTimeout(scrollTimeout);
        });
        
        this.pdfContainer.addEventListener('touchend', () => {
            scrollTimeout = setTimeout(() => {
                userScrolling = false;
                this.pdfContainer.classList.remove('user-scrolling');
            }, 1000);
        });
    }
    
    // 放大缩小PDF缩放功能
    updateScale(newScale, preserveCenter = true) {
        if (newScale < this.minScale || newScale > this.maxScale) return;
        
        // 临时禁用平滑滚动
        this.pdfContainer.classList.remove('user-scrolling');
        
        // 如果需要保持视图中心点
        if (preserveCenter) {
            const container = this.pdfContainer;
            
            // 计算当前视图中心点的相对位置
            const centerX = container.scrollLeft + container.clientWidth / 2;
            const centerY = container.scrollTop + container.clientHeight / 2;
            
            // 计算中心点在内容中的比例位置
            const scrollRatioX = centerX / (container.scrollWidth || 1);
            const scrollRatioY = centerY / (container.scrollHeight || 1);
            
            // 应用新的缩放比例
            const oldScale = this.scale;
            this.scale = newScale;
            this.updateZoomLevel();
            
            if (this.isScrollMode) {
                // 执行渲染
                this.resetScrollMode().then(() => {
                    // 渲染完成后，恢复视图中心点
                    // 给浏览器一些时间来计算新的滚动尺寸
                    setTimeout(() => {
                        // 计算新的滚动位置，保持中心点不变
                        const newScrollLeft = scrollRatioX * container.scrollWidth;
                        const newScrollTop = scrollRatioY * container.scrollHeight;
                        
                        // 应用新的滚动位置，不使用平滑滚动以避免动画效果
                        container.scrollTo({
                            left: newScrollLeft - container.clientWidth / 2,
                            top: newScrollTop - container.clientHeight / 2,
                            behavior: 'auto' // 不使用平滑滚动
                        });
                    }, 20); // 稍微增加延迟以确保渲染完成
                });
            } else {
                // 单页模式
                this.renderPage(this.currentPage, 'zoom');
            }
        } else {
            // 不保持中心点，直接应用缩放
            this.scale = newScale;
            this.updateZoomLevel();
            
            if (this.isScrollMode) {
                this.resetScrollMode();
            } else {
                this.renderPage(this.currentPage, 'zoom');
            }
        }
    }

    async zoomIn() {
        if (this.scale < this.maxScale) {
            const newScale = Math.min(this.scale + this.scaleStep, this.maxScale);
            this.updateScale(newScale, true);
            
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
            const newScale = Math.max(this.scale - this.scaleStep, this.minScale);
            this.updateScale(newScale, true);
            
            // 检查是否达到最小缩放
            if (this.scale <= this.minScale) {
                this.showZoomLimitMessage(`已达到最小缩放 ${Math.round(this.minScale * 100)}%`);
            }
        } else {
            this.showZoomLimitMessage(`已达到最小缩放 ${Math.round(this.minScale * 100)}%`);
        }
    }

    async fitToPage() {
        // 保存缩放前的视图中心点比例
        const container = this.pdfContainer;
        const scrollRatioX = (container.scrollLeft + container.clientWidth / 2) / (container.scrollWidth || 1);
        const scrollRatioY = (container.scrollTop + container.clientHeight / 2) / (container.scrollHeight || 1);
        
        // 临时禁用平滑滚动
        this.pdfContainer.classList.remove('user-scrolling');
        
        // 计算并应用默认缩放
        await this.calculateDefaultScale(false); // 先计算但不重新渲染
        
        // 使用updateScale应用缩放
        this.updateScale(this.defaultScale, true);
    }

    async calculateDefaultScale(shouldRerender = true) {
        if (!this.pdfDoc) return;
        
        // 获取当前页面
        const page = await this.pdfDoc.getPage(this.currentPage);
        const viewport = page.getViewport({ scale: 1.0 });
        
        // 获取PDF容器尺寸
        const containerWidth = this.pdfContainer.clientWidth - 40; // 减去内边距
        const containerHeight = this.pdfContainer.clientHeight - 40;
        
        // 计算适合宽度和高度的缩放比例
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        
        // 选择较小的缩放比例以确保整个页面都可见
        const oldScale = this.scale;
        this.defaultScale = Math.min(scaleX, scaleY) * 0.98; // 稍微缩小一点留出边距
        
        // 更新当前缩放
        this.scale = this.defaultScale;
        this.updateZoomLevel();
        
        // 根据需要重新渲染
        if (shouldRerender) {
            if (this.isScrollMode) {
                // 保存当前滚动位置
                const scrollPos = this.pdfContainer.scrollTop;
                const zoomRatio = this.scale / oldScale;
                
                // 重新渲染所有页面
                await this.resetScrollMode();
                
                // 恢复滚动位置，考虑缩放比例
                this.pdfContainer.scrollTop = scrollPos * zoomRatio;
            } else {
                await this.renderPage(this.currentPage);
            }
        }
    }

    // 重置滚动模式，用于缩放变化后重新渲染所有页面
    async resetScrollMode() {
        // 清空所有页面的渲染状态
        this.pageCanvases.forEach(page => {
            page.rendered = false;
        });
        
        // 重新初始化滚动模式
        await this.initializeScrollMode();
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
                e.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPage();
                break;
            case 'ArrowUp':
                if (this.isScrollMode) {
                    // 在滚动模式下，允许默认的滚动行为
                    return;
                }
                e.preventDefault();
                this.previousPage();
                break;
            case 'ArrowDown':
                if (this.isScrollMode) {
                    // 在滚动模式下，允许默认的滚动行为
                    return;
                }
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
        // 检查是否按住Ctrl键，如果是则进行缩放而不是滚动
        if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
                // 放大
                this.zoomIn();
            } else {
                // 缩小
                this.zoomOut();
            }
            return;
        }
        
        // 在滚动模式下，不阻止默认的滚动行为
        if (this.isScrollMode) {
            return;
        }
        
        // 非滚动模式下，使用之前的翻页逻辑
        const pdfContainer = document.getElementById('pdfContainer');
        
        // 如果缩放级别大于默认级别，允许内容滚动
        if (this.scale > this.defaultScale) {
            // 不阻止默认滚动行为，允许容器自然滚动
            return;
        }
        
        // 检测是否已经滚动到顶部或底部边界
        const isAtTop = pdfContainer.scrollTop <= 0;
        const isAtBottom = pdfContainer.scrollTop + pdfContainer.clientHeight >= pdfContainer.scrollHeight - 10;
        
        // 在边界处翻页，否则正常滚动
        if (e.deltaY > 0 && isAtBottom) { // 向下滚动且在底部
            e.preventDefault();
            this.nextPage();
        } else if (e.deltaY < 0 && isAtTop) { // 向上滚动且在顶部
            e.preventDefault();
            this.previousPage();
        }
    }

    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let initialScale = 1;
        let initialDistance = 0;
        let lastTapTime = 0;
        let panning = false;
        let lastPanX = 0;
        let lastPanY = 0;
        let pinchStarted = false; // 新增：跟踪捏合状态
        let lastZoomTimestamp = 0; // 新增：记录上次缩放时间戳
        let zoomHintShown = false; // 新增：跟踪缩放提示状态
        const pdfContainer = document.getElementById('pdfContainer');
        
        // 创建移动端缩放提示
        const createMobileZoomHint = () => {
            const hint = document.createElement('div');
            hint.className = 'mobile-zoom-hint';
            hint.textContent = '双指捏合可以缩放页面';
            document.body.appendChild(hint);
            return hint;
        };
        
        const mobileZoomHint = createMobileZoomHint();
        
        // 显示缩放提示的函数
        const showZoomHint = () => {
            if (!zoomHintShown && window.innerWidth <= 768) {
                zoomHintShown = true;
                mobileZoomHint.classList.add('visible');
                setTimeout(() => {
                    mobileZoomHint.classList.remove('visible');
                    setTimeout(() => {
                        zoomHintShown = false;
                    }, 300);
                }, 2000);
            }
        };

        // 监听整个PDF容器的触摸事件
        pdfContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                
                // 检测双击缩放
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTapTime;
                
                if (tapLength < 300 && tapLength > 0) {
                    // 双击缩放行为
                    e.preventDefault();
                    if (this.scale === this.defaultScale) {
                        this.scale = Math.min(this.defaultScale * 2, this.maxScale);
                    } else {
                        this.scale = this.defaultScale;
                    }
                    this.updateZoomLevel();
                    if (this.isScrollMode) {
                        this.resetScrollMode();
                    } else {
                        this.renderPage(this.currentPage, 'zoom');
                    }
                }
                
                lastTapTime = currentTime;
                
            } else if (e.touches.length === 2) {
                // 如果是移动设备，则显示缩放提示
                showZoomHint();
                
                // 捏合缩放初始值
                e.preventDefault(); // 防止页面缩放
                pinchStarted = true;
                initialScale = this.scale;
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                lastZoomTimestamp = Date.now();
            }
        }, { passive: false });

        pdfContainer.addEventListener('touchmove', (e) => {
            const now = Date.now();
            
            // 双指捏合缩放
            if (e.touches.length === 2 && pinchStarted) {
                e.preventDefault();
                
                // 节流处理，限制缩放频率
                if (now - lastZoomTimestamp < 16) return; // 大约60fps
                lastZoomTimestamp = now;
                
                // 捏合缩放行为 - 同时调整宽度和高度
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scaleChange = currentDistance / initialDistance;
                let newScale = initialScale * scaleChange;
                
                // 确保缩放在允许范围内
                newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
                
                // 如果变化足够大，则应用缩放
                if (Math.abs(newScale - this.scale) > 0.05) {
                    this.scale = newScale;
                    this.updateZoomLevel();
                    
                    // 优化移动端：推迟渲染以减少闪烁和提升性能
                    clearTimeout(this.touchZoomTimeout);
                    this.touchZoomTimeout = setTimeout(() => {
                        if (this.isScrollMode) {
                            this.resetScrollMode();
                        } else {
                            this.renderPage(this.currentPage, 'zoom');
                        }
                    }, 100); // 短暂延迟渲染
                }
            } 
            // 单指平移处理（当文档已缩放时）
            else if (e.touches.length === 1 && this.scale > this.defaultScale) {
                if (!panning) {
                    panning = true;
                    lastPanX = e.touches[0].clientX;
                    lastPanY = e.touches[0].clientY;
                } else {
                    const deltaX = e.touches[0].clientX - lastPanX;
                    const deltaY = e.touches[0].clientY - lastPanY;
                    
                    pdfContainer.scrollLeft -= deltaX;
                    pdfContainer.scrollTop -= deltaY;
                    
                    lastPanX = e.touches[0].clientX;
                    lastPanY = e.touches[0].clientY;
                }
            }
        }, { passive: false });

        pdfContainer.addEventListener('touchend', (e) => {
            panning = false;
            pinchStarted = false; // 重置捏合状态
            
            if (e.changedTouches.length === 1 && e.touches.length === 0) {
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                
                // 检测是否滚动到边界
                const isAtTop = pdfContainer.scrollTop <= 0;
                const isAtBottom = pdfContainer.scrollTop + pdfContainer.clientHeight >= pdfContainer.scrollHeight - 10;
                
                // 只有当缩放级别为默认且在滚动边界时才允许滑动翻页
                if (this.scale <= this.defaultScale) {
                    // 垂直滑动检测（更灵敏的垂直滑动翻页）
                    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
                        if (deltaY > 0 && isAtTop) {
                            this.previousPage(); // 向下滑动，在顶部时上一页
                        } else if (deltaY < 0 && isAtBottom) {
                            this.nextPage(); // 向上滑动，在底部时下一页
                        }
                    }
                }
            }
        }, { passive: true });
        
        // 处理触摸取消事件
        pdfContainer.addEventListener('touchcancel', () => {
            panning = false;
            pinchStarted = false;
        }, { passive: true });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleResize() {
        // 延迟执行以避免频繁调用
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(async () => {
            // 检测设备类型是否变化
            const wasMobile = this.isMobileDevice;
            this.isMobileDevice = window.innerWidth <= 768;
            
            // 如果设备类型变化，更新UI
            if (wasMobile !== this.isMobileDevice) {
                this.updateMobileClasses();
                this.generateThumbnails();
            }
            
            // 重新计算默认缩放并应用
            await this.calculateDefaultScale();
            
            // 根据屏幕宽度调整侧边栏状态
            if (this.isMobileDevice) {
                // 在移动设备上默认隐藏侧边栏
                const sidebarVisible = localStorage.getItem('sidebarVisible');
                if (sidebarVisible !== 'true') {
                    this.toggleSidebar(false);
                }
            }
        }, 300);
    }
    
    // 根据屏幕大小更新移动端类
    updateMobileClasses() {
        // 更新isMobileDevice标志
        this.isMobileDevice = window.innerWidth <= 768;
        
        // 更新body类
        if (this.isMobileDevice) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
        
        // 获取所有工具按钮
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const fitPageBtn = document.getElementById('fitPageBtn');
        
        // 在小屏幕上添加隐藏类
        if (this.isMobileDevice) {
            if (fullscreenBtn) fullscreenBtn.classList.add('hide-on-mobile');
        } else {
            if (fullscreenBtn) fullscreenBtn.classList.remove('hide-on-mobile');
        }
        
        // 在更小的屏幕上添加隐藏类
        if (window.innerWidth <= 480) {
            if (fitPageBtn) fitPageBtn.classList.add('hide-on-small');
        } else {
            if (fitPageBtn) fitPageBtn.classList.remove('hide-on-small');
        }
    }

    showError(message) {
        console.error('PDF查看器错误:', message);
        
        // 隐藏加载指示器，如果还在显示
        const loadingIndicator = document.getElementById('loadingIndicator');
        
        if (loadingIndicator) {
            // 创建错误消息元素
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>无法加载PDF文件</p>
                <p class="error-details">${message}</p>
                <button onclick="location.reload()" class="retry-button">重试</button>
                <button onclick="window.history.back()" class="retry-button secondary">返回</button>
            `;
            
            // 清空加载指示器并添加错误消息
            loadingIndicator.innerHTML = '';
            loadingIndicator.appendChild(errorMessage);
            
            // 确保加载指示器可见
            loadingIndicator.style.display = 'flex';
        }
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

    // 重新添加之前被错误删除的generateThumbnails函数
    async generateThumbnails() {
        if (!this.pdfDoc) return;
        
        // 移动设备上不生成缩略图，提高性能
        if (this.isMobileDevice) {
            // 移动设备上显示简洁提示信息
            this.thumbnailsContainer.innerHTML = '<div class="mobile-thumbnail-info">在此处滑动查看更多页面</div>';
            
            // 添加页码指示器
            this.addPageIndicatorsForMobile();
            return;
        }

        this.thumbnailsContainer.innerHTML = '';
        
        // 计算缩略图合适的缩放比例，基于侧边栏宽度和页面比例
        const calculateThumbnailScale = async () => {
            try {
                // 获取第一页作为参考
                const firstPage = await this.pdfDoc.getPage(1);
                const originalViewport = firstPage.getViewport({ scale: 1.0 });
                
                // 获取原始宽高比
                const aspectRatio = originalViewport.width / originalViewport.height;
                
                // 获取侧边栏实际宽度
                const sidebarWidth = this.sidebar.offsetWidth;
                // 缩略图需要考虑容器的内边距和边框
                const availableWidth = sidebarWidth - 60; // 减去padding和border
                
                // 计算基于宽度的缩放比例
                const scaleByWidth = availableWidth / originalViewport.width;
                
                // 计算合适的最小和最大高度
                const minHeight = 200; // 最小高度 (来自CSS)
                const maxHeight = 280; // 最大高度 (来自CSS)
                
                // 计算基于最小/最大高度的缩放比例
                const scaleByMinHeight = minHeight / originalViewport.height;
                const scaleByMaxHeight = maxHeight / originalViewport.height;
                
                // 确定最终缩放比例: 不小于最小高度所需比例，不大于最大高度所需比例
                let finalScale = Math.max(scaleByMinHeight, Math.min(scaleByWidth, scaleByMaxHeight));
                
                // 确保比例在合理范围内
                return Math.max(0.3, Math.min(1.5, finalScale));
            } catch (error) {
                console.error('计算缩略图比例失败:', error);
                // 返回默认值
                return 0.5;
            }
        };
        
        // 自动计算缩略图缩放比例
        const thumbnailScale = await calculateThumbnailScale();
        
        console.log('缩略图缩放比例:', thumbnailScale);

        for (let i = 1; i <= this.totalPages; i++) {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'thumbnail';
            thumbnailDiv.addEventListener('click', () => this.goToPage(i));
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            try {
                const page = await this.pdfDoc.getPage(i);
                // 使用动态计算的缩放比例
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
    
    // 为移动设备添加简单的页码指示器
    addPageIndicatorsForMobile() {
        if (!this.pdfDoc || !this.isMobileDevice) return;
        
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'mobile-page-indicators';
        
        // 只显示当前页码附近的几个页码
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;
        
        // 计算要显示的页码范围
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        // 调整显示范围以确保显示固定数量的指示器
        const indicatorsCount = 5;
        if (endPage - startPage + 1 < indicatorsCount) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + indicatorsCount - 1);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, endPage - indicatorsCount + 1);
            }
        }
        
        // 添加第一页指示器
        if (startPage > 1) {
            const firstIndicator = this.createPageIndicator(1);
            indicatorsContainer.appendChild(firstIndicator);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-indicator-ellipsis';
                ellipsis.textContent = '...';
                indicatorsContainer.appendChild(ellipsis);
            }
        }
        
        // 添加中间的页码指示器
        for (let i = startPage; i <= endPage; i++) {
            const indicator = this.createPageIndicator(i);
            indicatorsContainer.appendChild(indicator);
        }
        
        // 添加最后一页指示器
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-indicator-ellipsis';
                ellipsis.textContent = '...';
                indicatorsContainer.appendChild(ellipsis);
            }
            
            const lastIndicator = this.createPageIndicator(totalPages);
            indicatorsContainer.appendChild(lastIndicator);
        }
        
        this.thumbnailsContainer.appendChild(indicatorsContainer);
    }
    
    // 创建单个页码指示器
    createPageIndicator(pageNum) {
        const indicator = document.createElement('span');
        indicator.className = 'page-indicator';
        if (pageNum === this.currentPage) {
            indicator.classList.add('active');
        }
        indicator.textContent = pageNum;
        
        // 添加点击事件
        indicator.addEventListener('click', () => {
            this.goToPage(pageNum);
        });
        
        return indicator;
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