/**
 * api.js
 * --------------------------------------------------------------------------
 * 后端 API 客户端 - 封装 fetch 调用 Express 后端
 *
 * 配置方式（按优先级）：
 *   1. window.APP_CONFIG.apiBase  （推荐：在 index.html 注入）
 *   2. localStorage 键 "expense_api_base_v1"
 *   3. 默认值 "http://localhost:3001"
 *
 * 使用示例：
 *   const data = await ApiClient.auth.login({ username, password });
 * --------------------------------------------------------------------------
 */

const ApiClient = {
  /**
   * 获取后端基础地址
   */
  get base() {
    if (window.APP_CONFIG && window.APP_CONFIG.apiBase) {
      return window.APP_CONFIG.apiBase;
    }
    return localStorage.getItem("expense_api_base_v1") || "http://localhost:3001";
  },

  /**
   * 设置后端基础地址（运行时修改）
   */
  setBase(url) {
    localStorage.setItem("expense_api_base_v1", url);
  },

  /**
   * 通用请求方法
   * @param {string} path  例如 "/api/auth/login"
   * @param {object} options  fetch 选项
   * @returns {Promise<any>}  业务 JSON 数据
   */
  async request(path, options = {}) {
    const token = localStorage.getItem("expense_token_v1");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    let res;
    try {
      res = await fetch(`${this.base}${path}`, { ...options, headers });
    } catch (e) {
      // 网络层错误（后端未启动 / 跨域 / 断网）
      throw new Error(
        `无法连接后端服务 (${this.base})，请检查后端是否启动 🥺`
      );
    }

    // 解析 JSON 响应
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("服务器响应格式错误");
    }

    // HTTP 非 2xx
    if (!res.ok) {
      const err = new Error(data.message || `请求失败 (HTTP ${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  // ============== 业务接口 ==============
  auth: {
    /**
     * 注册
     * @param {{username: string, password: string, confirmPassword: string}} body
     */
    register(body) {
      return ApiClient.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    /**
     * 登录
     * @param {{username: string, password: string}} body
     */
    login(body) {
      return ApiClient.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },

  /**
   * 健康检查（测试后端是否可达）
   */
  health() {
    return ApiClient.request("/api/health");
  },
};

// 暴露到全局
window.ApiClient = ApiClient;
