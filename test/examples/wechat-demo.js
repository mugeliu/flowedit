// 旧编辑标签中加载完整的editorjs

(async function () {
  // 1. 引入 editor.js 脚本
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@editorjs/editorjs@2.30.8/dist/editorjs.umd.min.js';
  script.onload = initEditor;
  document.head.appendChild(script);

  function initEditor() {
    // 2. 创建容器元素并插入目标节点下
    const container = document.createElement('div');
    container.id = 'simple-editor';
    container.style = `
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: calc(100% + 8px);
      box-sizing: content-box;
      margin-left: -95px;
      padding: 0 91px;
      background: #fff;
      border: 1px solid #ccc;
    `;

    const target = document.getElementById('edui1_iframeholder');
    if (!target) {
      console.error('未找到 id="edui1_iframeholder" 的元素');
      return;
    }

    target.appendChild(container);

    // 3. 初始化 editor.js
    new EditorJS({
      holder: 'simple-editor',
      placeholder: '开始输入内容...',
    });
  }
})();



//  获取单个按钮插入的html并阻断插入。
/***************** 0. 帮助函数：打印 *****************/
function push(html) {
  console.log('%c[捕获到 HTML]', 'color:green', html);
  // 想阻断写入？在下面 insertBefore Hook 里 return 掉即可
}

/***************** 1. 监听「账号名片」按钮 *****************/
const btnProfile = document.querySelector('#js_editor_insertProfile');
if (btnProfile) {
  btnProfile.addEventListener('click', () => {
    console.log('%c[按钮] 账号名片被点击 ✅', 'color:orange');
  });
} else {
  console.warn('⚠️ 没找到 #js_editor_insertProfile，脚本执行得太早？');
}

/***************** 2. Hook insertBefore — 只针对 .ProseMirror *****************/
(() => {
  const rawInsertBefore = Element.prototype.insertBefore;
  Element.prototype.insertBefore = function (newNode, refNode) {
    // ⚠️ 这里判定：目标父节点或其祖先包含 .ProseMirror
    if (this.closest && this.closest('.ProseMirror')) {
      const html = newNode.outerHTML || newNode.textContent || '';
      if (html.trim()) push(html);
      // ===== 如需阻断双写，把下一行注释打开 =====
      console.log("阻断插入")
      return;                    // 阻断写入
    }
    return rawInsertBefore.call(this, newNode, refNode);
  };
  console.log('[Hook] insertBefore@.ProseMirror 已挂载');
})();

void 0;            // Console 不打印 undefined





//  获取上传图片的html
const editor = document.querySelector('.ProseMirror');
const mo = new MutationObserver((muts) => {
  muts.forEach((m) => {
    // ❶ 新节点插入：dataURL 阶段
    m.addedNodes.forEach((n) => {
      if (n.nodeType === 1 && n.matches('img[src^="data:image"]')) {
        console.log('[MO] 捕获 base64 占位符 →', n.outerHTML);
      }
    });

    // ❷ 属性变更：dataURL → 网络 URL
    if (
      m.type === 'attributes' &&
      m.attributeName === 'src' &&
      m.target.matches('img')
    ) {
      console.log('[MO] src 改写为网络地址 →', m.target.outerHTML);
      // 这里才是“最终 HTML”，可送入新编辑器或做后续处理
    }
  });
});

mo.observe(editor, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src'],    // 只关心 src 变动
});








//  父级事件委托打印

/******************************************************************
 * 0. 工具函数：把抓到的 HTML 打印出来
 ******************************************************************/
function push(html) {
  console.log('%c[HTML] 拦截到：', 'color:green', html);
}

/******************************************************************
 * 1. 监听所有按钮（父级事件委托）
 ******************************************************************/
const pluginsUL = document.querySelector('#js_plugins_list');

if (!pluginsUL) {
  console.warn('⚠️ 找不到 #js_plugins_list —— 脚本执行得太早？');
} else {
  pluginsUL.addEventListener(
    'click',
    (e) => {
      const li = e.target.closest('li');
      if (!li || !pluginsUL.contains(li)) return;

      // 打印按钮信息（id 或文本）
      const label = li.id || li.textContent.trim();
      console.log('%c[BTN] 点击：' + label, 'color:#1e90ff');
      /* 不阻断，页面继续执行异步请求 → 最终会触发下面的 HTML Hook */
    },
    true   // 捕获阶段，确保最早拿到事件
  );

  console.log('[委托] 已在 #js_plugins_list 启用 click 监听');
}

/******************************************************************
 * 2. Hook insertBefore（必要时你可再补 innerHTML/insertAdjacentHTML 双保险）
 *    只拦截写入 .ProseMirror（或 contenteditable） 的节点
 ******************************************************************/
(() => {
  const rawInsertBefore = Element.prototype.insertBefore;

  Element.prototype.insertBefore = function (newNode, refNode) {
    // 判断目标父节点或其祖先是否属于原编辑器
    if (this.closest && this.closest('.ProseMirror, [contenteditable]')) {
      const html = newNode.outerHTML || newNode.textContent || '';
      if (html.trim()) push(html);   // 打印拦截到的 HTML
      return;                        // 如需阻止写入则保留 return
    }
    return rawInsertBefore.call(this, newNode, refNode);
  };

  console.log('[Hook] insertBefore@.ProseMirror 已挂载');
})();

void 0;        // 保持 Console 整洁，不回显 undefined


//MutationObserver 拦截+处理
/******************** 0. 工具函数：处理捕获到的 HTML ********************/
function handleHTML(html) {
  console.log('%c[MO 捕获到 HTML]', 'color:green', html);

  // TODO: 想送到你自己的新编辑器？
  // newEditor.setValue(html);
}

/******************** 1. 等待 .ProseMirror 节点出现 ********************/
(function waitProseMirror() {
  const editor = document.querySelector('.ProseMirror');
  if (!editor) {
    requestAnimationFrame(waitProseMirror);
    return;
  }
  initObserver(editor);
})();

/******************** 2. 初始化 MutationObserver ********************/
function initObserver(target) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        // 过滤非元素/文本节点
        if (!(node.nodeType === 1 || node.nodeType === 3)) return;

        const html =
          node.nodeType === 3 ? node.textContent : node.outerHTML || '';
        if (!html.trim()) return;

        handleHTML(html);      // 1) 打印 / 2) 可送新编辑器
        console.log("阻断写入")
        /* ===== 如需阻断写入，把下一行取消注释 ===== */
        // node.remove();       // 阻断：删除新插入节点
      });
    });
  });

  observer.observe(target, { childList: true, subtree: true });
  console.log('[MO] MutationObserver 已启动，监控 .ProseMirror');
}

void 0; // 避免 Console 回显 undefined