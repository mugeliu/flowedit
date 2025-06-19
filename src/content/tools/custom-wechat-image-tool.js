/**
 * 自定义微信公众号图片上传工具
 * 基于真实的微信公众号上传接口实现
 */
import { IconPicture } from "@codexteam/icons";

class CustomWeChatImageTool {
  /**
   * 工具箱配置
   */
  static get toolbox() {
    return {
      title: "图片",
      icon: IconPicture,
    };
  }

  /**
   * 构造函数
   * @param {Object} options - 工具选项
   * @param {Object} options.data - 工具数据
   * @param {Object} options.config - 工具配置
   * @param {Object} options.api - Editor.js API
   */
  constructor({ data, config, api }) {
    this.api = api;
    this.config = config;
    this.data = data || {};
    this.wrapper = undefined;
    this.settings = [
      {
        name: "withBorder",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.043h2.25zm-7.586-5.43c1.734 0 3.441.365 4.365.731.924.366 1.78 1.108 1.78 1.108l-.547 1.371c-.11-.065-.294-.216-.294-.216-.151-.144-.338-.31-.538-.31-.351.024-.672.144-2.219-.144-1.547-.288-2.926-.288-2.926-.288-.65-.202-1.462-.476-2.284-.476-.822 0-1.634.274-2.284.476 0 0-1.379 0-2.926.288-1.547.288-1.868.168-2.219.144-.2 0-.387.166-.538.31 0 0-.184.151-.294.216l-.547-1.371s.856-.742 1.78-1.108C2.934 5.327 4.641 4.962 6.375 4.962z"/></svg>',
      },
      {
        name: "stretched",
        icon: '<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.512 1.511L4.084 3.787h9.606l-1.85-1.85a1.069 1.069 0 1 1 1.512-1.51l3.792 3.791a1.069 1.069 0 0 1-.375 1.755L12.978 9.66a1.125 1.125 0 0 1-1.59-1.591l1.703-1.703z"/></svg>',
      },
      {
        name: "withBackground",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l-2.158 2.159H8.9v2.137H4.7c-1.215 0-2.2-.936-2.2-2.09v-8.93c0-1.154.985-2.09 2.2-2.09h10.663c1.215 0 2.2.936 2.2 2.09v4.15h-2.137v-2.151l-3.183 3.183z"/></svg>',
      },
      {
        name: "sideBySide",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="7" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="4" width="7" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
      },
      {
        name: "carousel",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 10l3-2v4l-3-2z" fill="currentColor"/><circle cx="6" cy="17" r="1" fill="currentColor"/><circle cx="10" cy="17" r="1" fill="currentColor"/><circle cx="14" cy="17" r="1" fill="currentColor"/></svg>',
      },
    ];
  }

  /**
   * 渲染工具界面
   * @returns {HTMLElement} 工具的DOM元素
   */
  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("image-tool");

    // 初始化数据结构
    if (!this.data.images) {
      this.data.images = [];
    }
    if (!this.data.displayMode) {
      this.data.displayMode = 'single'; // single, sideBySide, carousel
    }
    if (!this.data.currentIndex) {
      this.data.currentIndex = 0;
    }

    this.renderContent();
    return this.wrapper;
  }

  /**
   * 创建上传按钮
   * @returns {HTMLElement} 上传按钮元素
   */
  createUploadButton() {
    const button = document.createElement("div");
    button.classList.add("image-tool__upload-button");
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.15 13.628A7.749 7.749 0 0 0 10 18.5a7.74 7.74 0 0 0 6.305-3.242l-2.387-2.127A4.254 4.254 0 0 1 10 15.5a4.25 4.25 0 0 1-3.957-2.7l-.893 2.828zm5.654-13.628c-1.778 0-3.418.784-4.525 2.032l2.387 2.127A4.254 4.254 0 0 1 10 2.5c1.616 0 3.027.9 3.756 2.32l.893-2.828A7.754 7.754 0 0 0 8.804 0zM4.868 6.1A7.749 7.749 0 0 0 2.5 10c0 1.387.366 2.688 1.006 3.814l2.694-2.417A4.254 4.254 0 0 1 5.75 10c0-.613.131-1.193.368-1.718L4.868 6.1zM15.132 13.9A7.749 7.749 0 0 0 17.5 10c0-1.387-.366-2.688-1.006-3.814L13.8 8.603A4.254 4.254 0 0 1 14.25 10c0 .613-.131 1.193-.368 1.718L15.132 13.9z"/>
      </svg>
      选择图片上传
    `;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true; // 支持多文件选择
    input.style.display = "none";
    input.addEventListener("change", this.uploadImage.bind(this));

    button.addEventListener("click", () => {
      input.click();
    });

    button.appendChild(input);
    return button;
  }

  /**
   * 上传图片到微信公众号
   * @param {Event} event - 文件选择事件
   */
  async uploadImage(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // 显示加载状态
    this.showLoader();

    // 批量上传图片
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await this.uploadSingleImage(file, i === files.length - 1);
    }
  }

  /**
   * 上传单张图片
   * @param {File} file - 图片文件
   * @param {boolean} isLast - 是否为最后一张图片
   */
  async uploadSingleImage(file, isLast = true) {

    try {
      // 生成唯一ID
      const uniqueId = "p" + Date.now();
      const timestamp = Math.random().toString();
      const token = this.getToken();

      // 构建上传URL
      const uploadUrl = "https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn";
      const params = new URLSearchParams({
        lang: "zh_CN",
        token: token,
        t: timestamp,
      });

      const fullUrl = `${uploadUrl}?${params.toString()}`;

      // 构建FormData
      const formData = new FormData();
      formData.append("upfile", file, file.name);

      // 构建headers
      const headers = {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        dnt: "1",
        origin: "https://mp.weixin.qq.com",
        priority: "u=1, i",
        referer: window.location.href,
        "sec-ch-ua":
          '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": navigator.userAgent,
      };

      // 上传开始日志
      console.log("开始上传图片:", file.name);

      // 发送请求到微信公众号上传接口
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: headers,
        body: formData,
        credentials: "include", // 重要：携带cookie
      });

      const result = await response.json();

      if (result.base_resp && result.base_resp.ret === 0) {
        // 上传成功，使用返回的url字段
        const imageUrl = result.url || result.content;
        console.log("图片上传成功:", imageUrl);
        
        // 如果是第一次上传或者不是多图模式，初始化数据
        if (!this.data.url && !this.data.images) {
          this.data = {
            url: imageUrl,
            images: [imageUrl],
            caption: "",
            withBorder: false,
            withBackground: false,
            stretched: false,
            sideBySide: false,
            carousel: false,
          };
        } else {
          // 如果已有图片，添加到images数组中
          if (!this.data.images) {
            this.data.images = this.data.url ? [this.data.url] : [];
          }
          this.data.images.push(imageUrl);
          // 更新主url为最新上传的图片
          this.data.url = imageUrl;
        }
        
        // 只在最后一张图片上传完成后刷新显示
        if (isLast) {
          this.showImage();
        }
      } else {
        console.error("上传失败:", result);
        throw new Error(
          result.base_resp ? result.base_resp.err_msg : "上传失败"
        );
      }
    } catch (error) {
      console.error("图片上传失败:", error);
      this.showError("图片上传失败: " + error.message);
    }
  }

  /**
   * 从页面URL参数获取token
   * @returns {string} token值
   */
  getToken() {
    // 从URL参数获取token（最稳定的方式）
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      return token;
    }

    // 如果URL中没有token，抛出错误
    throw new Error(
      "无法从URL参数中获取token，请确保在微信公众号编辑器环境中使用"
    );
  }

  /**
   * 显示加载状态
   */
  showLoader() {
    this.wrapper.innerHTML = `
      <div class="image-tool__loader">
        <div class="image-tool__loader-spinner"></div>
        <div class="image-tool__loader-text">正在上传图片...</div>
      </div>
    `;
  }

  /**
   * 显示错误信息
   * @param {string} message - 错误消息
   */
  showError(message) {
    this.wrapper.innerHTML = `
      <div class="image-tool__error">
        <div class="image-tool__error-text">${message}</div>
        <button class="image-tool__retry-button" onclick="this.parentNode.parentNode.querySelector('input').click()">重试</button>
      </div>
    `;

    // 重新添加文件输入
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.addEventListener("change", this.uploadImage.bind(this));
    this.wrapper.appendChild(input);
  }

  /**
   * 渲染内容区域
   */
  renderContent() {
    // 构建CSS类名
    const containerClasses = [
      "image-tool__image-container",
      this.data.stretched ? "image-tool__image-container--stretched" : "",
      this.data.withBorder ? "image-tool__image-container--with-border" : "",
      this.data.withBackground ? "image-tool__image-container--with-background" : "",
      this.data.displayMode === 'sideBySide' ? "image-tool__image-container--side-by-side" : "",
      this.data.displayMode === 'carousel' ? "image-tool__image-container--carousel" : ""
    ].filter(Boolean).join(" ");

    if (this.data.displayMode === 'sideBySide') {
      this.renderSideBySideMode(containerClasses);
    } else if (this.data.displayMode === 'carousel') {
      this.renderCarouselMode(containerClasses);
    } else {
      this.renderSingleMode(containerClasses);
    }
  }

  /**
   * 渲染单图模式
   * @param {string} containerClasses - 容器CSS类名
   */
  renderSingleMode(containerClasses) {
    const hasImage = this.data.images && this.data.images.length > 0;
    
    if (hasImage) {
      this.wrapper.innerHTML = `
        <div class="${containerClasses}" data-slot="0">
          <img class="image-tool__image" src="${this.data.images[0]}" alt="${this.data.caption || ""}" />
          <div class="image-tool__overlay">
            <button class="image-tool__change-btn">更换图片</button>
          </div>
        </div>
        ${
          this.data.caption
            ? `<div class="image-tool__caption">${this.data.caption}</div>`
            : ""
        }
      `;
    } else {
      this.wrapper.innerHTML = `
        <div class="${containerClasses}">
          ${this.createUploadSlot(0)}
        </div>
      `;
    }
    
    this.bindUploadEvents();
  }

  /**
   * 渲染并排模式
   * @param {string} containerClasses - 容器CSS类名
   */
  renderSideBySideMode(containerClasses) {
    const slot1 = this.data.images && this.data.images[0] 
      ? `<div class="image-tool__slot" data-slot="0">
           <img class="image-tool__image" src="${this.data.images[0]}" alt="${this.data.caption || ""}" />
           <div class="image-tool__overlay">
             <button class="image-tool__change-btn">更换</button>
           </div>
         </div>`
      : `<div class="image-tool__slot" data-slot="0">${this.createUploadSlot(0)}</div>`;
    
    const slot2 = this.data.images && this.data.images[1] 
      ? `<div class="image-tool__slot" data-slot="1">
           <img class="image-tool__image" src="${this.data.images[1]}" alt="${this.data.caption || ""}" />
           <div class="image-tool__overlay">
             <button class="image-tool__change-btn">更换</button>
           </div>
         </div>`
      : `<div class="image-tool__slot" data-slot="1">${this.createUploadSlot(1)}</div>`;
    
    this.wrapper.innerHTML = `
      <div class="${containerClasses}">
        ${slot1}
        ${slot2}
      </div>
      ${
        this.data.caption
          ? `<div class="image-tool__caption">${this.data.caption}</div>`
          : ""
      }
    `;
    
    this.bindUploadEvents();
  }

  /**
   * 渲染轮播模式
   * @param {string} containerClasses - 容器CSS类名
   */
  renderCarouselMode(containerClasses) {
    const currentIndex = this.data.currentIndex || 0;
    const hasCurrentImage = this.data.images && this.data.images[currentIndex];
    
    let contentHtml;
    if (hasCurrentImage) {
      contentHtml = `
        <img class="image-tool__image" src="${this.data.images[currentIndex]}" alt="${this.data.caption || ""}" />
        <div class="image-tool__overlay">
          <button class="image-tool__change-btn">更换图片</button>
        </div>
      `;
    } else {
      contentHtml = this.createUploadSlot(currentIndex);
    }
    
    this.wrapper.innerHTML = `
      <div class="${containerClasses}" data-slot="${currentIndex}">
        <div class="image-tool__carousel-container">
          ${contentHtml}
        </div>
        <button class="image-tool__carousel-btn image-tool__carousel-btn--prev" ${currentIndex === 0 ? 'disabled' : ''}>‹</button>
        <button class="image-tool__carousel-btn image-tool__carousel-btn--next">›</button>
        <div class="image-tool__carousel-indicator">
          <span class="image-tool__carousel-counter">${currentIndex + 1} / ${Math.max(currentIndex + 1, this.data.images ? this.data.images.length : 1)}</span>
        </div>
      </div>
      ${
        this.data.caption
          ? `<div class="image-tool__caption">${this.data.caption}</div>`
          : ""
      }
    `;
    
    this.bindUploadEvents();
    this.bindCarouselEvents();
  }

  /**
   * 创建上传插槽
   * @param {number} slotIndex - 插槽索引
   * @returns {string} 上传插槽HTML
   */
  createUploadSlot(slotIndex) {
    return `
      <div class="image-tool__upload-slot" data-slot="${slotIndex}">
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.15 13.628A7.749 7.749 0 0 0 10 18.5a7.74 7.74 0 0 0 6.305-3.242l-2.387-2.127A4.254 4.254 0 0 1 10 15.5a4.25 4.25 0 0 1-3.957-2.7l-.893 2.828zm5.654-13.628c-1.778 0-3.418.784-4.525 2.032l2.387 2.127A4.254 4.254 0 0 1 10 2.5c1.616 0 3.027.9 3.756 2.32l.893-2.828A7.754 7.754 0 0 0 8.804 0zM4.868 6.1A7.749 7.749 0 0 0 2.5 10c0 1.387.366 2.688 1.006 3.814l2.694-2.417A4.254 4.254 0 0 1 5.75 10c0-.613.131-1.193.368-1.718L4.868 6.1zM15.132 13.9A7.749 7.749 0 0 0 17.5 10c0-1.387-.366-2.688-1.006-3.814L13.8 8.603A4.254 4.254 0 0 1 14.25 10c0 .613-.131 1.193-.368 1.718L15.132 13.9z"/>
        </svg>
        <span>点击上传图片</span>
      </div>
    `;
  }

  /**
   * 绑定上传事件
   */
  bindUploadEvents() {
    // 绑定上传插槽点击事件
    const uploadSlots = this.wrapper.querySelectorAll('.image-tool__upload-slot');
    uploadSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const slotIndex = parseInt(slot.dataset.slot);
        this.openFileSelector(slotIndex);
      });
    });

    // 绑定更换图片按钮事件
    const changeButtons = this.wrapper.querySelectorAll('.image-tool__change-btn');
    changeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const container = button.closest('[data-slot]');
        const slotIndex = parseInt(container.dataset.slot);
        this.openFileSelector(slotIndex);
      });
    });
  }

  /**
   * 绑定轮播事件
   */
  bindCarouselEvents() {
    const prevBtn = this.wrapper.querySelector('.image-tool__carousel-btn--prev');
    const nextBtn = this.wrapper.querySelector('.image-tool__carousel-btn--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.navigateCarousel('prev');
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.navigateCarousel('next');
      });
    }
  }

  /**
   * 轮播导航
   * @param {string} direction - 方向 'prev' 或 'next'
   */
  navigateCarousel(direction) {
    const currentIndex = this.data.currentIndex || 0;
    let newIndex;

    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next') {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    this.data.currentIndex = newIndex;
    this.renderContent();
  }

  /**
   * 打开文件选择器
   * @param {number} slotIndex - 插槽索引
   */
  openFileSelector(slotIndex) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadImageToSlot(file, slotIndex);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  /**
   * 上传图片到指定插槽
   * @param {File} file - 图片文件
   * @param {number} slotIndex - 插槽索引
   */
  async uploadImageToSlot(file, slotIndex) {
    // 显示加载状态
    const targetSlot = this.wrapper.querySelector(`[data-slot="${slotIndex}"]`);
    if (targetSlot) {
      const loadingHtml = `
        <div class="image-tool__loading">
          <div class="image-tool__loading-spinner"></div>
          <span>上传中...</span>
        </div>
      `;
      
      if (this.data.displayMode === 'carousel') {
        targetSlot.querySelector('.image-tool__carousel-container').innerHTML = loadingHtml;
      } else {
        targetSlot.innerHTML = loadingHtml;
      }
    }

    try {
      // 生成唯一ID
      const uniqueId = "p" + Date.now();
      const timestamp = Math.random().toString();
      const token = this.getToken();

      // 构建上传URL
      const uploadUrl = "https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn";
      const params = new URLSearchParams({
        lang: "zh_CN",
        token: token,
        t: timestamp,
      });

      const fullUrl = `${uploadUrl}?${params.toString()}`;

      // 构建FormData
      const formData = new FormData();
      formData.append("upfile", file, file.name);

      // 构建headers
      const headers = {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        dnt: "1",
        origin: "https://mp.weixin.qq.com",
        priority: "u=1, i",
        referer: window.location.href,
        "sec-ch-ua":
          '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": navigator.userAgent,
      };

      // 发送请求到微信公众号上传接口
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: headers,
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (result.base_resp && result.base_resp.ret === 0) {
        const imageUrl = result.url || result.content;
        
        // 确保images数组存在
        if (!this.data.images) {
          this.data.images = [];
        }
        
        // 设置图片到指定位置
        this.data.images[slotIndex] = imageUrl;
        
        // 更新主URL（兼容性）
        if (slotIndex === 0 || !this.data.url) {
          this.data.url = imageUrl;
        }
        
        // 重新渲染
        this.renderContent();
      } else {
        throw new Error(result.base_resp ? result.base_resp.err_msg : "上传失败");
      }
    } catch (error) {
      console.error('上传失败:', error);
      if (targetSlot) {
        const errorHtml = `
          <div class="image-tool__error">
            <span>上传失败，请重试</span>
          </div>
        `;
        
        if (this.data.displayMode === 'carousel') {
          targetSlot.querySelector('.image-tool__carousel-container').innerHTML = errorHtml;
        } else {
          targetSlot.innerHTML = errorHtml;
        }
      }
    }
  }

  /**
   * 渲染设置面板
   * @returns {HTMLElement} 设置面板元素
   */
  renderSettings() {
    const wrapper = document.createElement("div");

    this.settings.forEach((tune) => {
      const button = document.createElement("div");
      button.classList.add("cdx-settings-button");
      button.classList.toggle(
        "cdx-settings-button--active",
        this.data[tune.name]
      );
      button.innerHTML = tune.icon;

      button.addEventListener("click", () => {
        this.toggleTune(tune.name);
        button.classList.toggle(
          "cdx-settings-button--active",
          this.data[tune.name]
        );
      });

      wrapper.appendChild(button);
    });

    return wrapper;
  }

  /**
   * 初始化轮播功能
   */
  initCarousel() {
    const container = this.wrapper.querySelector('.image-tool__carousel-container');
    const images = this.wrapper.querySelectorAll('.image-tool__image');
    const dots = this.wrapper.querySelectorAll('.image-tool__carousel-dot');
    const prevBtn = this.wrapper.querySelector('.image-tool__carousel-btn--prev');
    const nextBtn = this.wrapper.querySelector('.image-tool__carousel-btn--next');
    
    let currentIndex = 0;
    
    /**
     * 显示指定索引的图片
     * @param {number} index - 图片索引
     */
    const showImage = (index) => {
      images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      currentIndex = index;
    };
    
    // 上一张按钮
    prevBtn.addEventListener('click', () => {
      const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      showImage(newIndex);
    });
    
    // 下一张按钮
    nextBtn.addEventListener('click', () => {
      const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      showImage(newIndex);
    });
    
    // 点击圆点导航
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showImage(index);
      });
    });
  }

  /**
   * 切换图片样式设置
   * @param {string} tuneName - 设置名称
   */
  toggleTune(tuneName) {
    // 处理显示模式切换
    if (tuneName === 'sideBySide' || tuneName === 'carousel') {
      // 重置所有显示模式
      this.data.sideBySide = false;
      this.data.carousel = false;
      
      // 设置新的显示模式
      this.data[tuneName] = true;
      this.data.displayMode = tuneName;
      
      // 初始化多图数据
      if (!this.data.images) {
        this.data.images = this.data.url ? [this.data.url] : [];
      }
    } else {
      // 其他设置的切换
      this.data[tuneName] = !this.data[tuneName];
    }
    
    this.renderContent();
  }

  /**
   * 保存工具数据
   * @returns {Object} 工具数据
   */
  save() {
    return {
      url: this.data.url,
      images: this.data.images || [],
      displayMode: this.data.displayMode || 'single',
      caption: this.data.caption || '',
      withBorder: this.data.withBorder || false,
      withBackground: this.data.withBackground || false,
      stretched: this.data.stretched || false,
      sideBySide: this.data.sideBySide || false,
      carousel: this.data.carousel || false,
      currentIndex: this.data.currentIndex || 0
    };
  }

  /**
   * 验证工具数据
   * @param {Object} savedData - 保存的数据
   * @returns {boolean} 数据是否有效
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * 工具是否为内联工具
   * @returns {boolean} 是否为内联工具
   */
  static get isInline() {
    return false;
  }

  /**
   * 工具数据验证
   * @param {Object} savedData - 保存的数据
   * @returns {boolean} 数据是否有效
   */
  validate(savedData) {
    return savedData.url && savedData.url.trim() !== "";
  }
}

export default CustomWeChatImageTool;
