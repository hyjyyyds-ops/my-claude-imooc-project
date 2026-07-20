/**
 * NumberPad.js
 * --------------------------------------------------------------------------
 * 自定义数字键盘组件 - 记账页专用
 *
 * 使用方式：
 *   NumberPad.mount("#number-keypad", {
 *     onInput: (key) => { ... },     // 用户输入了数字或小数点
 *     onBackspace: () => { ... },    // 用户按了删除键
 *   });
 * --------------------------------------------------------------------------
 */

const NumberPad = {
  /**
   * 渲染数字键盘到容器，并自动绑定点击事件
   * @param {string|HTMLElement} container
   * @param {object} options { onInput, onBackspace }
   * @returns {HTMLElement|null} 容器元素
   */
  mount(container, options = {}) {
    const { onInput = () => {}, onBackspace = () => {} } = options;

    const el = typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return null;

    el.className = "number-keypad";
    el.innerHTML = `
      <div class="keypad-grid">
        <button class="key-btn" data-key="7">7</button>
        <button class="key-btn" data-key="8">8</button>
        <button class="key-btn" data-key="9">9</button>
        <button class="key-btn" data-key="4">4</button>
        <button class="key-btn" data-key="5">5</button>
        <button class="key-btn" data-key="6">6</button>
        <button class="key-btn" data-key="1">1</button>
        <button class="key-btn" data-key="2">2</button>
        <button class="key-btn" data-key="3">3</button>
        <button class="key-btn" data-key=".">.</button>
        <button class="key-btn" data-key="0">0</button>
        <button class="key-btn clear" data-key="backspace">⌫</button>
      </div>
    `;

    // 使用事件委托：单个监听器处理所有按键
    el.querySelector(".keypad-grid").addEventListener("click", (e) => {
      const target = e.target.closest("[data-key]");
      if (!target) return;

      const key = target.dataset.key;
      if (key === "backspace") {
        onBackspace();
      } else {
        onInput(key);
      }
    });

    return el;
  },
};