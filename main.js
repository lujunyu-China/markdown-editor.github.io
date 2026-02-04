// 简单前端逻辑：render、保存、下载
const mdEditor = document.getElementById('md-editor');
const cssEditor = document.getElementById('css-editor');
const preview = document.getElementById('preview');
const downloadMdBtn = document.getElementById('download-md');
const downloadCssBtn = document.getElementById('download-css');
const loadSampleBtn = document.getElementById('load-sample');
const resetCssBtn = document.getElementById('reset-css');
const clearStorageBtn = document.getElementById('clear-storage');
const sanitizeCheckbox = document.getElementById('sanitize');

const LS_MD = 'ghpages-md-editor-md';
const LS_CSS = 'ghpages-md-editor-css';

// 默认示例
const defaultMd = `# 欢迎使用 Markdown 编辑器

这是一个运行在 GitHub Pages 上的静态 Markdown 编辑器示例。

- 实时预览
- 编辑 CSS 并立即在预览中生效
- 下载为 .md 或 .css 文件

\`\`\`js
console.log('Hello Markdown');
\`\`\`
`;

const defaultCss = `/* 这是用于预览的示例 CSS */
.preview {
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  color: #222;
}
.preview h1 { color: #0b66c3; }
`;

// 恢复 localStorage
function loadFromStorage() {
  mdEditor.value = localStorage.getItem(LS_MD) || defaultMd;
  cssEditor.value = localStorage.getItem(LS_CSS) || defaultCss;
}

// 保存到 localStorage（节流）
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(LS_MD, mdEditor.value);
    localStorage.setItem(LS_CSS, cssEditor.value);
  }, 400);
}

// 渲染预览（将用户 CSS 注入到 .preview 内部的 style 标签）
function renderPreview() {
  const md = mdEditor.value || '';
  const html = marked.parse(md, { sanitize: false });
  const safeHtml = sanitizeCheckbox.checked ? DOMPurify.sanitize(html) : html;

  // 插入 CSS（只作用于 preview 容器）
  const styleTag = `<style id="user-css">${cssEditor.value || ''}</style>`;
  preview.innerHTML = styleTag + safeHtml;
}

// 下载帮助
function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// 事件
mdEditor.addEventListener('input', () => { scheduleSave(); renderPreview(); });
cssEditor.addEventListener('input', () => { scheduleSave(); renderPreview(); });

downloadMdBtn.addEventListener('click', () => {
  const filename = prompt('下载文件名（不需要扩展名）', 'content') || 'content';
  downloadText(filename + '.md', mdEditor.value);
});

downloadCssBtn.addEventListener('click', () => {
  const filename = prompt('下载文件名（不需要扩展名）', 'styles') || 'styles';
  downloadText(filename + '.css', cssEditor.value);
});

loadSampleBtn.addEventListener('click', () => {
  if (confirm('加载示例会覆盖当前编辑内容，确定吗？')) {
    mdEditor.value = defaultMd;
    cssEditor.value = defaultCss;
    scheduleSave();
    renderPreview();
  }
});

resetCssBtn.addEventListener('click', () => {
  if (confirm('重置 CSS 为示例样式？')) {
    cssEditor.value = defaultCss;
    scheduleSave();
    renderPreview();
  }
});

clearStorageBtn.addEventListener('click', () => {
  if (confirm('清除本地保存（localStorage）？')) {
    localStorage.removeItem(LS_MD);
    localStorage.removeItem(LS_CSS);
    loadFromStorage();
    renderPreview();
  }
});

// 初始化
loadFromStorage();
renderPreview();