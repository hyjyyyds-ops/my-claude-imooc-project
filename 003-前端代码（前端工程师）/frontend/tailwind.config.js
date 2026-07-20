/**
 * tailwind.config.js
 * --------------------------------------------------------------------------
 * Tailwind CSS 配置文件 - 每日记账 V1.0.1
 *
 * 基于 Stitch "Healing Petals" 设计系统定义的设计 tokens。
 * 全局颜色、字号、间距、圆角都通过 CSS 变量定义，便于统一调整。
 * --------------------------------------------------------------------------
 */

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* 基础表面 */
        surface: "#fff8f6",
        "surface-dim": "#fbd1c4",
        "surface-bright": "#fff8f6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fff1ed",
        "surface-container": "#ffe9e3",
        "surface-container-high": "#ffe2da",
        "surface-container-highest": "#ffdbd0",
        "surface-variant": "#ffdbd0",
        "surface-white": "#FFFFFF",
        "bg-milk-white": "#FFF5F7",

        /* 文字 */
        "on-surface": "#2c160e",
        "on-surface-variant": "#514345",
        "on-background": "#2c160e",
        "text-warm-grey": "#8D7B7B",

        /* 主色调 - 樱花粉 */
        "primary-container": "#ffb7c5",
        "primary-fixed": "#ffd9df",
        "primary-fixed-dim": "#fbb3c1",
        "on-primary-container": "#7b4551",
        "on-primary-fixed": "#360c19",
        "on-primary-fixed-variant": "#6b3743",
        "inverse-primary": "#fbb3c1",
        primary: "#864e5a",
        "on-primary": "#ffffff",

        /* 强调色 - 奶油桃 */
        "secondary-container": "#ffd1dc",
        "secondary-fixed": "#ffd9e2",
        "secondary-fixed-dim": "#e7bbc6",
        "on-secondary-container": "#7a5761",
        "on-secondary-fixed": "#2d141c",
        "on-secondary-fixed-variant": "#5e3e47",
        secondary: "#78555e",
        "on-secondary": "#ffffff",

        /* 点缀色 - 薰衣草紫 */
        "tertiary-container": "#c8c9dc",
        "tertiary-fixed": "#e1e1f5",
        "tertiary-fixed-dim": "#c5c5d8",
        "on-tertiary-container": "#525464",
        "on-tertiary-fixed": "#191b29",
        "on-tertiary-fixed-variant": "#444655",
        tertiary: "#5c5d6e",
        "on-tertiary": "#ffffff",

        /* 功能色 */
        "expense-coral": "#FF8A80",   // 支出 - 珊瑚红
        "income-mint": "#A5D6A7",     // 收入 - 薄荷绿（V1.0 预留）
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        /* 描边 */
        outline: "#837375",
        "outline-variant": "#d6c2c4",
      },

      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "1.75rem",
        full: "9999px",
      },

      spacing: {
        base: "4px",
        "container-margin": "20px",
        gutter: "16px",
        "card-padding": "24px",
        "max-width-mobile": "430px",
        "max-width-desktop": "600px",
      },

      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
      },

      fontSize: {
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "26px", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },

      boxShadow: {
        pink: "0 4px 20px rgba(255, 183, 197, 0.25)",
        "pink-strong": "0 4px 25px rgba(255, 183, 197, 0.4)",
        soft: "0 2px 12px rgba(0, 0, 0, 0.05)",
      },
    },
  },
};