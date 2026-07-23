/**
 * api.js
 * --------------------------------------------------------------------------
 * 后端 API 客户端 - 封装 fetch 调用 Spring Boot / Express 后端
 *
 * 配置方式（按优先级）：
 *   1. window.APP_CONFIG.apiBase  （推荐：在 index.html 注入）
 *   2. localStorage 键 "expense_api_base_v1"
 *   3. 默认值 "http://localhost:8080"（Spring Boot）
 *
 * 切换后端：在浏览器控制台执行
 *   ApiClient.setBase("http://localhost:3001");  // 切到 Node.js
 *   ApiClient.setBase("http://localhost:8080");  // 切到 Spring Boot
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
    return localStorage.getItem("expense_api_base_v1") || "http://localhost:8080";
  },

  /**
   * 设置后端基础地址（运行时修改）
   */
  setBase(url) {
    localStorage.setItem("expense_api_base_v1", url);
  },

  /**
   * 通用请求方法
   */
  async request(path, options = {}) {
    let token = localStorage.getItem("expense_token_v1");

    // 容错：清除 token 值中可能存在的多余引号（之前手动 setItem 可能写错）
    if (token && (token.startsWith('"') || token.startsWith("'"))) {
      token = token.slice(1, -1);
      localStorage.setItem("expense_token_v1", token);
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    let res;
    try {
      res = await fetch(`${this.base}${path}`, { ...options, headers });
    } catch (e) {
      throw new Error(
        `无法连接后端服务 (${this.base})，请检查后端是否启动 🥺`
      );
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("服务器响应格式错误");
    }

    if (!res.ok) {
      // ========== 401 自动跳转登录 ==========
      if (res.status === 401 && !path.includes("/auth/")) {
        console.warn("[ApiClient] 401 - token 无效，自动清空并跳转登录");
        // 清掉无效 session
        ApiClient._clearSession();
        // 跳转到登录页（如果当前不在登录/注册页）
        if (typeof Router !== "undefined" && Router.navigateTo) {
          Router.navigateTo("login");
        } else {
          // 兜底：直接 reload
          location.reload();
        }
      }
      const err = new Error(data.message || `请求失败 (HTTP ${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  /**
   * 内部：清空本地 session（不影响其他 localStorage 数据）
   */
  _clearSession() {
    localStorage.removeItem("expense_token_v1");
    localStorage.removeItem("expense_current_user_v1");
    localStorage.removeItem("expense_user_v1");
  },

  // ============== 业务接口 ==============

  auth: {
    register(body) {
      return ApiClient.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    login(body) {
      return ApiClient.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },

  records: {
    /** 新增记账 */
    create(body) {
      return ApiClient.request("/api/records", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    /** 查询列表（支持 startDate / endDate / categoryId） */
    list(params = {}) {
      const qs = new URLSearchParams(params).toString();
      return ApiClient.request(`/api/records${qs ? "?" + qs : ""}`);
    },
    /** 月度统计 */
    stats(period = "current") {
      return ApiClient.request(`/api/records/stats?period=${encodeURIComponent(period)}`);
    },
  },

  categories: {
    /** 获取当前用户的所有分类 */
    list() {
      return ApiClient.request("/api/categories");
    },
    /** 新增自定义分类 */
    create(body) {
      return ApiClient.request("/api/categories", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    /** 删除自定义分类 */
    delete(id) {
      return ApiClient.request(`/api/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  },

  users: {
    /** 获取当前登录用户信息（含 streak, lastDate） */
    me() {
      return ApiClient.request("/api/users/me");
    },
  },

  /**
   * 健康检查
   */
  health() {
    return ApiClient.request("/api/health");
  },
};

window.ApiClient = ApiClient;