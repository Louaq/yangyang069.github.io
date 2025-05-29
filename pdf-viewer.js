// PDF查看器主要功能
class PDFViewer {
    constructor() {
        this.currentUrl = '';
        this.currentTitle = '';
        this.isFullscreen = false;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5; // 初始缩放比例
        this.pdfInstance = null;
        this.rendering = false;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.canvas = null;
        this.ctx = null;
        this.isGoogleDriveUrl = false;
        this.googleDriveFileId = '';
        this.pdfData = null;
        this.init();
    }

    init() {
        this.parseUrlParams();
        this.setupEventListeners();
        this.loadPDF();
    }

    // 解析URL参数
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentUrl = urlParams.get('url') || '';
        this.currentTitle = urlParams.get('title') || 'PDF文档';
        
        // 设置标题
        document.getElementById('presentationTitle').textContent = this.currentTitle;
        document.title = `${this.currentTitle} - PDF查看器 - YangYang`;

        // 检查是否是Google Drive链接
        if (this.currentUrl.includes('drive.google.com')) {
            this.isGoogleDriveUrl = true;
            // 提取Google Drive文件ID
            const match = this.currentUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match) {
                this.googleDriveFileId = match[1];
                console.log('Google Drive文件ID:', this.googleDriveFileId);
            }
        }

        console.log('解析的参数:', {
            url: this.currentUrl,
            title: this.currentTitle,
            isGoogleDriveUrl: this.isGoogleDriveUrl
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 上一页按钮
        document.getElementById('prevPageBtn')?.addEventListener('click', () => this.prevPage());
        document.getElementById('prevPageBtnBottom')?.addEventListener('click', () => this.prevPage());
        
        // 下一页按钮
        document.getElementById('nextPageBtn')?.addEventListener('click', () => this.nextPage());
        document.getElementById('nextPageBtnBottom')?.addEventListener('click', () => this.nextPage());
        
        // 首页和尾页按钮
        document.getElementById('firstPageBtn')?.addEventListener('click', () => this.gotoPage(1));
        document.getElementById('lastPageBtn')?.addEventListener('click', () => this.gotoPage(this.totalPages));
        
        // 缩放按钮
        document.getElementById('zoomInBtn')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.zoomOut());
        
        // 全屏按钮
        document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
        
        // 分享按钮
        document.getElementById('shareBtn')?.addEventListener('click', () => this.showShareModal());
        
        // 下载原始PDF按钮
        document.getElementById('downloadOriginalBtn')?.addEventListener('click', () => this.downloadPDF());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyboardEvents(e));
        
        // 全屏状态变化监听
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());
    }

    // 加载PDF
    async loadPDF() {
        if (!this.currentUrl) {
            this.showError('未提供PDF URL');
            return;
        }

        try {
            // 显示加载指示器
            document.getElementById('pdfLoading').style.display = 'flex';
            
            let pdfUrl = this.currentUrl;
            let directDownloadUrl = null;
            
            // 如果是Google Drive链接，使用替代方法获取PDF
            if (this.isGoogleDriveUrl && this.googleDriveFileId) {
                // 使用本地PDF文件作为备选方案
                if (this.googleDriveFileId === '1F_-B5dBFDnUULavpaM1SWXx-FXBBzvFw') {
                    directDownloadUrl = './pdf/978-3-031-82024-3_8.pdf';
                    console.log('使用本地PDF文件:', directDownloadUrl);
                } else {
                    // 使用导出API
                    directDownloadUrl = `https://drive.google.com/uc?export=download&id=${this.googleDriveFileId}`;
                    console.log('使用Google Drive导出API:', directDownloadUrl);
                }
            }
            
            // 设置下载原始文件按钮的链接
            document.getElementById('downloadOriginalBtn').onclick = () => {
                if (directDownloadUrl) {
                    window.open(directDownloadUrl, '_blank');
                } else {
                    window.open(this.currentUrl, '_blank');
                }
            };
            
            try {
                // 加载PDF文件
                const loadingTask = pdfjsLib.getDocument({
                    url: directDownloadUrl || pdfUrl,
                    cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                    cMapPacked: true
                });
                
                // 显示加载UI
                this.hideLoading();
                
                // 等待PDF加载完成
                this.pdfDoc = await loadingTask.promise;
                this.totalPages = this.pdfDoc.numPages;
                
                // 更新页码信息
                document.getElementById('totalPages').textContent = this.totalPages;
                document.getElementById('pageInfo').textContent = `1 / ${this.totalPages}`;
                
                // 渲染PDF
                this.renderAllPages();
            } catch (error) {
                console.error('PDF加载错误:', error);
                
                // 如果直接加载失败，尝试从本地加载
                if (this.isGoogleDriveUrl && this.googleDriveFileId === '1F_-B5dBFDnUULavpaM1SWXx-FXBBzvFw') {
                    try {
                        const backupPdfUrl = './pdf/978-3-031-82024-3_8.pdf';
                        console.log('尝试加载本地备份PDF:', backupPdfUrl);
                        
                        const backupLoadingTask = pdfjsLib.getDocument({
                            url: backupPdfUrl,
                            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                            cMapPacked: true
                        });
                        
                        this.pdfDoc = await backupLoadingTask.promise;
                        this.totalPages = this.pdfDoc.numPages;
                        
                        // 更新页码信息
                        document.getElementById('totalPages').textContent = this.totalPages;
                        document.getElementById('pageInfo').textContent = `1 / ${this.totalPages}`;
                        
                        // 渲染PDF
                        this.renderAllPages();
                        return;
                    } catch (backupError) {
                        console.error('备份PDF加载失败:', backupError);
                    }
                }
                
                // 所有尝试都失败
                this.showError(`无法加载PDF: ${error.message}`);
            }
        } catch (error) {
            console.error('加载PDF出错:', error);
            this.showError('加载PDF时出现错误');
        }
    }
    
    // 渲染所有页面
    async renderAllPages() {
        const viewerContainer = document.getElementById('pdfViewerContainer');
        viewerContainer.innerHTML = ''; // 清空容器
        
        // 隐藏加载指示器
        document.getElementById('pdfLoading').style.display = 'none';
        
        // 遍历所有页面并渲染
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
            await this.renderPage(pageNum, viewerContainer);
        }
    }
    
    // 渲染单个页面
    async renderPage(pageNum, container) {
        try {
            // 获取页面
            const page = await this.pdfDoc.getPage(pageNum);
            
            // 计算适合视口的尺寸
            const viewport = page.getViewport({ scale: this.scale });
            
            // 创建画布
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page';
            canvas.id = `page-${pageNum}`;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // 添加到容器
            container.appendChild(canvas);
            
            // 渲染PDF页面到画布
            const context = canvas.getContext('2d');
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // 如果是当前页，滚动到这个位置
            if (pageNum === this.currentPage) {
                canvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            return canvas;
        } catch (error) {
            console.error(`渲染页面 ${pageNum} 失败:`, error);
            return null;
        }
    }
    
    // 转到指定页面
    gotoPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages) {
            return;
        }
        
        this.currentPage = pageNum;
        
        // 更新页码显示
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('pageInfo').textContent = `${this.currentPage} / ${this.totalPages}`;
        
        // 滚动到指定页面
        const targetPage = document.getElementById(`page-${this.currentPage}`);
        if (targetPage) {
            targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // 上一页
    prevPage() {
        if (this.currentPage > 1) {
            this.gotoPage(this.currentPage - 1);
        }
    }
    
    // 下一页
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.gotoPage(this.currentPage + 1);
        }
    }
    
    // 放大
    zoomIn() {
        this.scale *= 1.2;
        this.rerenderWithNewScale();
    }
    
    // 缩小
    zoomOut() {
        this.scale /= 1.2;
        this.rerenderWithNewScale();
    }
    
    // 以新的缩放比例重新渲染
    async rerenderWithNewScale() {
        // 记住当前页
        const currentPageNum = this.currentPage;
        
        // 显示加载指示器
        document.getElementById('pdfLoading').style.display = 'flex';
        
        // 重新渲染所有页面
        await this.renderAllPages();
        
        // 滚动到当前页
        this.gotoPage(currentPageNum);
    }
    
    // 下载PDF
    downloadPDF() {
        if (this.isGoogleDriveUrl && this.googleDriveFileId) {
            if (this.googleDriveFileId === '1F_-B5dBFDnUULavpaM1SWXx-FXBBzvFw') {
                // 对于本地文件，提供本地下载链接
                window.open('./pdf/978-3-031-82024-3_8.pdf', '_blank');
            } else {
                // 对于Google Drive链接，使用导出下载
                const downloadUrl = `https://drive.google.com/uc?export=download&id=${this.googleDriveFileId}`;
                window.open(downloadUrl, '_blank');
            }
        } else {
            // 对于其他链接，直接打开
            window.open(this.currentUrl, '_blank');
        }
    }

    // 处理键盘事件
    handleKeyboardEvents(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.prevPage();
                break;
            case 'ArrowRight':
                this.nextPage();
                break;
            case 'ArrowUp':
                this.prevPage();
                break;
            case 'ArrowDown':
                this.nextPage();
                break;
            case 'Home':
                this.gotoPage(1);
                break;
            case 'End':
                this.gotoPage(this.totalPages);
                break;
            case '+':
                this.zoomIn();
                break;
            case '-':
                this.zoomOut();
                break;
        }
    }

    // 显示错误信息
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        this.hideLoading();
    }

    // 隐藏加载指示器
    hideLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const pptViewerContainer = document.getElementById('pptViewerContainer');
        
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
            pptViewerContainer.style.display = 'flex';
        }, 1000);
    }

    // 切换全屏模式
    toggleFullscreen() {
        const container = document.getElementById('pptViewerContainer');
        
        if (!this.isFullscreen) {
            this.requestFullscreen(container);
        } else {
            this.exitFullscreen();
        }
    }

    // 请求全屏
    requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    // 退出全屏
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // 全屏状态变化
    onFullscreenChange() {
        this.isFullscreen = Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );

        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            if (this.isFullscreen) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.title = '退出全屏';
            } else {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = '全屏模式';
            }
        }
    }

    // 显示分享模态框
    showShareModal() {
        const shareModal = document.getElementById('shareModal');
        const shareLink = document.getElementById('shareLink');
        
        // 生成当前查看页面的URL
        const currentUrl = window.location.href;
        shareLink.value = currentUrl;
        
        shareModal.style.display = 'flex';
    }
}

// 关闭分享模态框
function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// 复制分享链接
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    showToast('链接已复制到剪贴板', 2000);
}

// 通过邮件分享
function shareViaEmail() {
    const shareLink = document.getElementById('shareLink').value;
    const subject = encodeURIComponent('分享PDF文档');
    const body = encodeURIComponent(`我想与你分享一个PDF文档：${shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
}

// 显示提示信息
function showToast(message, duration = 3000) {
    // 检查是否已有Toast元素
    let toast = document.getElementById('toast');
    
    if (!toast) {
        // 创建Toast元素
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // 设置消息
    toast.textContent = message;
    toast.classList.add('show');
    
    // 定时隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 获取URL参数
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 创建PDF查看器URL
function createPDFViewerUrl(pdfUrl, title = '') {
    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams();
    
    if (pdfUrl) params.set('url', pdfUrl);
    if (title) params.set('title', title);
    
    return `${baseUrl}?${params.toString()}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化PDF查看器
    new PDFViewer();
}); 