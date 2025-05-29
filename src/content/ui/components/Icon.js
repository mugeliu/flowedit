// 图标组件
// 负责创建SVG图标元素

/**
 * 创建SVG图标元素
 * @param {string} pathData - SVG路径数据
 * @param {string} fill - 填充颜色
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {SVGElement} 创建的SVG元素
 */
export function createIcon(pathData, fill = '#4C4D4E', width = 24, height = 24) {
  const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgIcon.setAttribute('width', width.toString());
  svgIcon.setAttribute('height', height.toString());
  svgIcon.setAttribute('viewBox', '0 0 24 24');
  
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('fill', fill);
  iconPath.setAttribute('fill-rule', 'evenodd');
  iconPath.setAttribute('d', pathData);
  svgIcon.appendChild(iconPath);
  
  return svgIcon;
}
