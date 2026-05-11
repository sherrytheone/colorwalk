// Cloudinary 配置
const CLOUD_NAME = 'dtxdjupp4';
const UPLOAD_PRESET = 'color_walk_upload';

/**
 * 上传图片到 Cloudinary（带重试机制）
 * @param file 图片文件
 * @param maxRetries 最大重试次数
 * @returns 上传后的图片 URL
 */
export async function uploadToCloudinary(file: File, maxRetries: number = 3): Promise<string> {
  console.log('开始上传到 Cloudinary...');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'colorwalk');

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`上传尝试 ${attempt}/${maxRetries}...`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Cloudinary 上传失败 (尝试 ${attempt}):`, errorData);
        throw new Error(errorData.error?.message || '上传失败');
      }

      const data = await response.json();
      console.log('Cloudinary 完整响应:', data);
      console.log('Cloudinary secure_url:', data.secure_url);
      console.log('Cloudinary url:', data.url);
      
      // 优先使用 secure_url (https)，如果不存在则使用 url
      const imageUrl = data.secure_url || data.url;
      if (!imageUrl) {
        throw new Error('Cloudinary 响应中没有找到图片 URL');
      }
      
      console.log('Cloudinary 上传成功！');
      return imageUrl;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Cloudinary 上传错误 (尝试 ${attempt}):`, lastError.message);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待后重试（指数退避）
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Cloudinary 上传失败，已重试多次');
}
