import ImageTool from "@editorjs/image";

/**
 * 自定义微信图片上传工具
 * 继承自 @editorjs/image 的 ImageTool
 */
export default class CustomImageTool extends ImageTool {
  /**
   * 构造函数
   */
  constructor({ data, config, api, readOnly, block }) {
    // 直接传递原始配置给父类，不修改uploader
    super({ data, config, api, readOnly, block });
    
  }

  /**
   * 重写父类的uploadFile方法，直接处理文件上传
   * @param {File} file - 要上传的文件
   */
  uploadFile(file) {
    console.log('=== CustomImageTool.uploadFile 开始 ===');
    console.log('文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    // 检查文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ 文件大小检查失败: 文件大小超过10MB限制');
      this.uploadingFailed("文件大小不能超过10MB");
      return;
    }
    console.log('✅ 文件大小检查通过');

    // 获取微信token
    const token = this.getWeChatToken();
    console.log('获取到的token:', token);
    
    if (!token) {
      console.log('❌ Token检查失败: 未找到微信token');
      this.uploadingFailed("未找到微信token，请确保在微信公众号后台中使用");
      return;
    }
    console.log('✅ Token检查通过');

    // 显示加载状态
    console.log('显示加载状态...');
    this.ui.showPreloader();

    // 执行实际的上传逻辑
    console.log('🚀 开始执行上传逻辑...');
    this.performUpload(file, token)
      .then(result => {
        console.log('✅ 上传成功:', result);
        // 成功时调用onUpload
        this.onUpload({
          success: 1,
          file: {
            url: result.url
          }
        });
      })
      .catch(error => {
        console.log('❌ 上传失败:', error);
        // 失败时调用uploadingFailed
        this.uploadingFailed(error.message || error.toString());
      });
  }



  /**
   * 执行微信图片上传
   * @param {File} file - 要上传的文件
   * @param {string} token - 微信token
   * @returns {Promise<{url: string}>} 上传结果
   */
  async performUpload(file, token) {
    console.log('=== performUpload 开始 ===');
    console.log('上传参数:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      token: token
    });
    
    // 构建FormData - 按照微信API的正确格式
    const formData = new FormData();
    
    // 添加文件元数据
    const fileId = 'p' + Date.now();
    const formDataParams = {
      id: fileId,
      name: file.name,
      type: file.type,
      lastModifiedDate: file.lastModifiedDate || new Date().toString(),
      size: file.size.toString()
    };
    
    console.log('FormData参数:', formDataParams);
    
    formData.append("id", fileId);
    formData.append("name", file.name);
    formData.append("type", file.type);
    formData.append("lastModifiedDate", file.lastModifiedDate || new Date().toString());
    formData.append("size", file.size.toString());
    
    // 添加实际文件
    formData.append("upfile", file, file.name);
    console.log('已添加文件到FormData');

    // 构建上传URL - 使用正确的t参数格式
    const uploadUrl = "https://mp.weixin.qq.com/cgi-bin/uploadimg2cdn";
    const urlParams = {
      lang: "zh_CN",
      token: token,
      t: Math.random().toString() // 使用随机数而不是时间戳
    };
    const params = new URLSearchParams(urlParams);
    const fullUrl = `${uploadUrl}?${params.toString()}`;
    
    console.log('请求URL参数:', urlParams);
    console.log('完整请求URL:', fullUrl);

    // 自定义请求头
    const headers = {
      "accept": "*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "origin": "https://mp.weixin.qq.com",
      "referer": window.location.href,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": navigator.userAgent
    };
    
    console.log('请求头:', headers);
    console.log('当前页面URL:', window.location.href);

    try {
      console.log('🌐 发送fetch请求...');
      const response = await fetch(fullUrl, {
        method: "POST",
        body: formData,
        headers: headers,
        credentials: "include"
      });
      
      console.log('📡 收到响应:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 微信API总是返回200状态码，需要检查响应体中的base_resp
      if (!response.ok) {
        console.log('❌ HTTP响应错误');
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 响应数据:', data);
      console.log("upload_data", data);

      // 检查微信API响应：ret=0表示成功，负值表示失败
      if (data.base_resp && data.base_resp.ret === 0) {
        console.log('✅ 微信API响应成功');
        // 成功：返回图片URL
        return {
          url: data.url
        };
      } else {
        console.log('❌ 微信API响应失败:', data.base_resp);
        // 失败：base_resp.ret为负值（如-203）
        const errorMsg = data.base_resp?.err_msg || "上传失败";
        const retCode = data.base_resp?.ret || "未知错误";
        throw new Error(`${errorMsg} (错误码: ${retCode})`);
      }
    } catch (error) {
      console.log('💥 请求异常:', error);
      console.error("图片上传失败:", error);
      const errorMessage = error.message || "上传失败";
      throw new Error(`图片上传失败: ${errorMessage}`);
    }
  }

  /**
   * 获取微信token
   * @returns {string|null} 微信token
   */
  getWeChatToken() {
    // 从URL参数中获取token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    return token;
  }


  /**
   * 指定工具是否为内联工具
   */
  static get isInline() {
    return false;
  }
}
