// Seedance API 服务
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const API_KEY = '3d84fc3d-cf04-485f-a9df-c81790ae8944';
const MODEL = 'ep-20260318164518-5tjpr';

interface SeedanceResponse {
  data?: Array<{
    url?: string;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * 调用 Seedance API 生成徽章图案
 * @param imageUrl 图片的公开 URL (必须是 http/https 开头的公开可访问 URL)
 * @returns 生成的徽章图片 URL
 */
export async function generateBadgeWithSeedance(imageUrl: string): Promise<string> {
  console.log('开始调用 Seedance API...');
  console.log('图片 URL:', imageUrl);
  
  // 验证 URL 格式
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    throw new Error(`Invalid URL format: ${imageUrl.substring(0, 50)}... URL must start with http:// or https://`);
  }

  const requestBody = {
    model: MODEL,
    prompt: '从真实照片中提取最有识别度的主体建筑元素，例如窗户、门廊、立面、拱门、屋顶、阳台或建筑正面。 将该建筑元素转化为一个简约的“冰箱贴式建筑图标”： 1、保留建筑的核心轮廓和标志性特征； 2、造型简洁、干净、像旅行纪念品冰箱贴； 3、有轻微立体感； 4、边缘清晰，白色或浅色描边； 5、细节适度简化，不要画得太复杂； 6、图标位于画面居中位置； 7、图标尺寸适中且精致，周围保留大量留白。8、背景为绿幕的荧光绿色',
    image: imageUrl,
    sequential_image_generation: 'disabled',
    response_format: 'url',
    size: '2K',
    stream: false,
    watermark: true
  };

  try {
    console.log('发送请求到:', API_URL);
    console.log('请求体:', JSON.stringify({ ...requestBody, image: imageUrl.substring(0, 50) + '...' }));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('收到响应，状态码:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 错误响应:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data: SeedanceResponse = await response.json();
    console.log('API 响应数据:', data);

    if (data.error) {
      throw new Error(`API Error: ${data.error.message} (code: ${data.error.code})`);
    }

    if (!data.data || data.data.length === 0 || !data.data[0].url) {
      throw new Error('API 返回数据格式错误: 没有 URL');
    }

    console.log('成功获取徽章 URL:', data.data[0].url);
    return data.data[0].url;
  } catch (error) {
    console.error('Seedance API 调用失败:', error);
    
    // 提供更详细的错误信息
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('网络请求失败，可能是 CORS 问题或网络连接问题。请检查浏览器控制台获取更多信息。');
    }
    
    throw error;
  }
}

/**
 * 将 URL 转换为 base64，并去除白色背景（抠图）
 * 开发环境使用代理，生产环境直接请求
 */
export async function urlToBase64WithTransparentBackground(url: string): Promise<string> {
  console.log('开始转换 URL 到 base64 并抠图:', url.substring(0, 50) + '...');

  try {
    // 将外部 URL 转换为代理 URL（仅在开发环境）
    let fetchUrl = url;
    const isDev = import.meta.env.DEV;
    
    if (isDev && url.includes('tos-cn-beijing.volces.com')) {
      // 开发环境使用 Vite 代理
      const urlObj = new URL(url);
      fetchUrl = '/seedance-image' + urlObj.pathname + urlObj.search;
      console.log('开发环境使用代理 URL:', fetchUrl);
    } else {
      console.log('生产环境直接请求 URL:', fetchUrl);
    }

    const response = await fetch(fetchUrl);
    console.log('图片下载状态:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    console.log('图片 blob 大小:', blob.size);

    // 使用 Canvas 去除白色背景
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('图片加载成功，尺寸:', img.width, 'x', img.height);
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建 canvas context'));
          return;
        }

        // 绘制原图
        ctx.drawImage(img, 0, 0);
        
        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 荧光绿色值 #9EFE54 -> RGB(158, 254, 84)
        const greenScreenR = 158;
        const greenScreenG = 254;
        const greenScreenB = 84;
        // 基础容差
        const baseTolerance = 60;
        // 投影区域容差（更大）
        const shadowTolerance = 200;
        
        // 遍历像素，将荧光绿背景变为透明
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // 计算与目标荧光绿的欧几里得距离
          const distance = Math.sqrt(
            Math.pow(r - greenScreenR, 2) +
            Math.pow(g - greenScreenG, 2) +
            Math.pow(b - greenScreenB, 2)
          );
          
          // 检查是否是绿色主导的颜色（绿幕背景或投影）
          // 条件1：颜色距离在容差范围内
          // 条件2：绿色通道明显强于红色和蓝色（绿色主导）
          const isGreenDominant = g > r + 20 && g > b + 20;
          const isNearGreenScreen = distance < shadowTolerance;
          
          if (isNearGreenScreen && isGreenDominant) {
            // 设置为透明
            data[i + 3] = 0;
          }
        }
        
        // 将处理后的数据放回 canvas
        ctx.putImageData(imageData, 0, 0);
        
        // 导出为 PNG（支持透明）
        const transparentBase64 = canvas.toDataURL('image/png');
        console.log('成功转换为透明背景 base64');
        resolve(transparentBase64);
      };
      
      img.onerror = (e) => {
        console.error('图片加载错误:', e);
        reject(new Error('Image load failed'));
      };
      
      // 使用 blob URL 加载图片
      const blobUrl = URL.createObjectURL(blob);
      img.src = blobUrl;
    });
  } catch (error) {
    console.error('转换 URL 到 base64 失败:', error);
    throw error;
  }
}

/**
 * 将 URL 转换为 base64（保留原样，不抠图）
 * 开发环境使用代理，生产环境直接请求
 */
export async function urlToBase64(url: string): Promise<string> {
  console.log('开始转换 URL 到 base64:', url.substring(0, 50) + '...');

  try {
    // 将外部 URL 转换为代理 URL（仅在开发环境）
    let fetchUrl = url;
    const isDev = import.meta.env.DEV;
    
    if (isDev && url.includes('tos-cn-beijing.volces.com')) {
      // 开发环境使用 Vite 代理
      const urlObj = new URL(url);
      fetchUrl = '/seedance-image' + urlObj.pathname + urlObj.search;
      console.log('开发环境使用代理 URL:', fetchUrl);
    } else {
      console.log('生产环境直接请求 URL:', fetchUrl);
    }

    const response = await fetch(fetchUrl);
    console.log('图片下载状态:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    console.log('图片 blob 大小:', blob.size);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('成功转换为 base64');
        resolve(reader.result as string);
      };
      reader.onerror = (e) => {
        console.error('FileReader 错误:', e);
        reject(new Error('FileReader failed'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('转换 URL 到 base64 失败:', error);
    throw error;
  }
}
