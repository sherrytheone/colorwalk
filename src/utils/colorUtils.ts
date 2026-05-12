// 将RGB数组转换为十六进制颜色
export function rgbToHex(rgb: [number, number, number]): string {
  return '#' + rgb.map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// 将十六进制颜色转换为RGB
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

// 判断颜色是深色还是浅色（用于决定文字颜色）
export function isDarkColor(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// 获取对比色（黑或白）
export function getContrastColor(rgb: [number, number, number]): string {
  return isDarkColor(rgb) ? '#FFFFFF' : '#333333';
}

// 调整颜色亮度
export function adjustBrightness(rgb: [number, number, number], factor: number): [number, number, number] {
  return rgb.map((c) => {
    const adjusted = Math.round(c * factor);
    return Math.max(0, Math.min(255, adjusted));
  }) as [number, number, number];
}

// 从图片提取主色调（使用Canvas的简单实现）
export function extractDominantColor(image: HTMLImageElement): [number, number, number] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [128, 128, 128];
  
  // 缩小图片以提高性能
  const size = 50;
  canvas.width = size;
  canvas.height = size;
  
  ctx.drawImage(image, 0, 0, size, size);
  
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  let r = 0, g = 0, b = 0;
  let count = 0;
  
  // 采样像素
  for (let i = 0; i < data.length; i += 16) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  
  return [
    Math.round(r / count),
    Math.round(g / count),
    Math.round(b / count)
  ];
}

// 提取调色板
export function extractColorPalette(image: HTMLImageElement, colorCount: number = 5): [number, number, number][] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  
  ctx.drawImage(image, 0, 0, size, size);
  
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  const colorMap = new Map<string, number>();
  
  // 量化颜色并统计频率
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }
  
  // 按频率排序并返回前N个颜色
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return [r, g, b] as [number, number, number];
    });
  
  return sortedColors;
}
