/**
 * 微信图片上传工具模块
 * 提供微信图片上传相关的方法
 */

/**
 * 强制清理图片工具UI状态
 * 解决EditorJS hidePreloader方法不生效的问题
 */
function forceCleanImageToolUI() {
  setTimeout(() => {
    // 强制清理preloader样式和状态
    const preloaders = document.querySelectorAll(
      ".image-tool__image-preloader"
    );
    preloaders.forEach((preloader) => {
      preloader.style.backgroundImage = "";
      preloader.style.display = "none";
    });

    // 强制重置容器状态类
    const containers = document.querySelectorAll(".image-tool");
    containers.forEach((container) => {
      container.classList.remove("image-tool--uploading", "image-tool--filled");
      container.classList.add("image-tool--empty");
    });
  }, 50);
}

/**
 * 验证图片文件
 * @param {File} file - 要验证的文件
 * @returns {Promise<void>} 验证结果
 */
function validateImageFile(file) {
  return new Promise((resolve, reject) => {
    // 检查文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("文件大小不能超过10MB"));
      return;
    }

    // 检查文件类型
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error("仅支持 JPEG、PNG、GIF、WebP 格式的图片"));
      return;
    }

    resolve();
  });
}

/**
 * 从 background script 获取微信数据
 * @returns {Promise} Promise对象，成功时resolve微信数据，失败时reject错误信息
 */
async function getWeChatDataFromBackground() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "get_wechat_data" }, (response) => {
      if (response && response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response?.error || "background script 加载失败"));
      }
    });
  });
}

/**
 * 执行微信图片上传
 * @param {File} file - 要上传的文件
 * @returns {Promise<{url: string}>} 上传结果
 */
export async function performWeChatUpload(file) {
  let wechatData;

  console.log("开始执行微信图片上传");

  try {
    wechatData = await getWeChatDataFromBackground();
  } catch (error) {
    throw new Error("无法获取wx数据，请确保在微信公众号后台中使用");
  }

  if (!wechatData.token) {
    throw new Error("wx数据中未找到微信token，请确保在微信公众号后台中使用");
  }

  // 构建FormData
  const formData = new FormData();
  const fileId = "p" + Date.now();

  formData.append("id", fileId);
  formData.append("name", file.name);
  formData.append("type", file.type);
  formData.append("lastModifiedDate", new Date().toString());
  formData.append("size", file.size.toString());
  formData.append("file", file, file.name);

  // 构建上传URL和参数
  const uploadUrl = "https://mp.weixin.qq.com/cgi-bin/filetransfer";
  const urlParams = {
    action: "upload_material",
    f: "json",
    scene: "8",
    writetype: "doublewrite",
    groupid: "1",
    // 使用从 background script 获取的动态参数
    ticket_id: wechatData.userName,
    ticket: wechatData.ticket,
    svr_time: wechatData.time,
    token: wechatData.token,
    lang: "zh_CN",
    seq: Date.now().toString(),
    t: Math.random().toString(),
  };
  const params = new URLSearchParams(urlParams);
  const fullUrl = `${uploadUrl}?${params.toString()}`;

  // 请求头
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

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      body: formData,
      headers: headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 检查微信API响应
    if (data.base_resp && data.base_resp.ret === 0) {
      return {
        url: data.cdn_url,
      };
    } else {
      const errorMsg = data.base_resp?.err_msg || "上传失败";
      const retCode = data.base_resp?.ret || "未知错误";
      throw new Error(`${errorMsg} (错误码: ${retCode})`);
    }
  } catch (error) {
    const errorMessage = error.message || "上传失败";
    throw new Error(`图片上传图库失败: ${errorMessage}`);
  }
}

/**
 * 创建微信图片上传器配置
 * @returns {Object} 微信图片上传器配置对象
 */
export function createWeChatImageUploader() {
  return {
    /**
     * 通过文件上传图片到微信服务器
     * @param {File} file - 要上传的文件
     * @returns {Promise} Promise对象，成功时resolve上传结果，失败时reject错误信息
     */
    async uploadByFile(file) {
      try {
        // 验证文件
        await validateImageFile(file);

        // 执行上传逻辑
        const result = await performWeChatUpload(file);

        // 成功时返回EditorJS期望的格式
        return {
          success: 1,
          file: {
            url: result.url,
            fileName: file.name ? file.name.replace(/\.[^/.]+$/, "") : "",
          },
        };
      } catch (error) {
        // 强制清理UI状态
        forceCleanImageToolUI();
        return {
          success: 0,
          file: {
            error: error.message,
          },
        };
      }
    },

    /**
     * 通过URL上传图片到微信服务器
     * @param {string} url - 图片URL
     * @returns {Promise} Promise对象，成功时resolve上传结果，失败时reject错误信息
     */
    async uploadByUrl(url) {
      try {
        // 下载图片转换为File对象
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();

        // 从URL中提取文件名
        const urlParts = url.split("/");
        const fileName = urlParts[urlParts.length - 1] || "image.jpg";

        // 创建File对象
        const file = new File([blob], fileName, {
          type: blob.type || "image/jpeg",
        });

        // 验证文件
        await validateImageFile(file);

        // 使用文件上传逻辑
        const result = await performWeChatUpload(file);

        // 成功时返回EditorJS期望的格式
        return {
          success: 1,
          file: {
            url: result.url,
            fileName: file.name ? file.name.replace(/\.[^/.]+$/, "") : "",
          },
        };
      } catch (error) {
        // 强制清理UI状态
        forceCleanImageToolUI();

        return {
          success: 0, // 关键！告诉 Image Tool 上传失败
          file: { error: error.message },
        };
      }
    },
  };
}
