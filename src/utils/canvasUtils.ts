import { BadgeShape } from '@/types';

// 创建圆形裁剪图片
export function createCircularBadge(
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // 创建圆形裁剪路径
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  
  // 绘制图片
  ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
  
  // 添加白色边框
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  return canvas.toDataURL('image/png');
}

// 创建方形徽章
export function createSquareBadge(
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // 圆角矩形
  const radius = 12;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
  
  // 添加白色边框
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  return canvas.toDataURL('image/png');
}

// 创建六边形徽章
export function createHexagonBadge(
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // 六边形路径
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 2;
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = centerX + radius * Math.cos(angle);
    const py = centerY + radius * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.clip();
  
  ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
  
  // 添加白色边框
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  return canvas.toDataURL('image/png');
}

// 根据形状创建徽章
export function createBadge(
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  shape: BadgeShape
): string {
  switch (shape) {
    case 'circle':
      return createCircularBadge(image, x, y, size);
    case 'square':
      return createSquareBadge(image, x, y, size);
    case 'hexagon':
      return createHexagonBadge(image, x, y, size);
    default:
      return createCircularBadge(image, x, y, size);
  }
}

// 压缩图片
export function compressImage(
  image: HTMLImageElement,
  maxWidth: number = 2000
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }
    
    let width = image.width;
    let height = image.height;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(image, 0, 0, width, height);
    
    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
}
