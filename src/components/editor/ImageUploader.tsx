import { useCallback, useState } from 'react';
import { Upload, X, ImageIcon, Loader2, Cloud } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { generateBadgeWithSeedance, urlToBase64WithTransparentBackground } from '@/utils/seedanceApi';
import { uploadToCloudinary } from '@/utils/cloudinaryApi';
import { compressImage } from '@/utils/imageCompression';

export function ImageUploader() {
  const { originalImage, setOriginalImage, setColors, setBadge, reset } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件 (JPG/PNG)');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return false;
    }
    return true;
  };

  const processImage = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setError('');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      console.log('图片已读取，长度:', result.length);
      setOriginalImage(result);

      // 提取颜色
      const img = new Image();
      img.onload = async () => {
        try {
          console.log('开始提取颜色...');
          const { extractDominantColor, extractColorPalette } = await import('@/utils/colorUtils');
          const dominant = extractDominantColor(img);
          const palette = extractColorPalette(img, 5);
          console.log('颜色提取完成:', dominant);
          setColors({ dominant, palette });

          // 压缩图片
          console.log('开始压缩图片...');
          let fileToUpload: File | Blob = file;
          try {
            const compressedBlob = await compressImage(file, 1200, 0.8);
            // 如果压缩后小于原图，使用压缩版本
            if (compressedBlob.size < file.size * 0.9) {
              console.log(`使用压缩后的图片: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
              fileToUpload = compressedBlob;
            } else {
              console.log('压缩效果不明显，使用原图');
            }
          } catch (compressError) {
            console.warn('图片压缩失败，使用原图:', compressError);
          }

          // 上传到 Cloudinary 获取公开 URL
          console.log('开始上传到 Cloudinary...');
          setIsUploading(false);
          setIsGeneratingBadge(true);
          
          let cloudinaryUrl: string;
          try {
            cloudinaryUrl = await uploadToCloudinary(fileToUpload as File);
            console.log('Cloudinary 上传成功，URL:', cloudinaryUrl);
            console.log('URL 类型检查 - 是否以 https 开头:', cloudinaryUrl.startsWith('https://'));
          } catch (uploadError) {
            console.error('Cloudinary 上传失败:', uploadError);
            setError(`图片上传失败: ${uploadError instanceof Error ? uploadError.message : '未知错误'}`);
            setIsGeneratingBadge(false);
            return;
          }

          // 等待一段时间，确保 Cloudinary 图片完全可用
          console.log('等待 Cloudinary 图片处理完成...');
          await new Promise(resolve => setTimeout(resolve, 3000));

          // 调用 Seedance API 生成徽章（使用 Cloudinary URL）
          console.log('开始调用 Seedance API 生成徽章...');
          console.log('使用 Cloudinary URL:', cloudinaryUrl);
          
          try {
            // 调用 API 生成徽章
            const badgeUrl = await generateBadgeWithSeedance(cloudinaryUrl);
            console.log('获取到徽章 URL:', badgeUrl);

            // 将 URL 转换为 base64 并去除白色背景（抠图）
            console.log('开始转换徽章为 base64 并抠图...');
            const badgeBase64 = await urlToBase64WithTransparentBackground(badgeUrl);
            console.log('徽章 base64 长度:', badgeBase64.length);

            setBadge({
              imageData: badgeBase64,
              shape: 'circle',
              position: { x: 0, y: 0 }
            });
            console.log('徽章设置完成！');
          } catch (apiError) {
            console.error('Seedance API 调用失败:', apiError);
            setError(`AI 徽章生成失败: ${apiError instanceof Error ? apiError.message : '未知错误'}`);

            // 如果 API 失败，回退到本地生成
            console.log('使用本地生成作为备用...');
            const { createBadge } = await import('@/utils/canvasUtils');
            const centerX = (img.width - 120) / 2;
            const centerY = (img.height - 120) / 2;
            const badgeData = createBadge(img, centerX, centerY, 120, 'circle');
            setBadge({
              imageData: badgeData,
              shape: 'circle',
              position: { x: 0, y: 0 }
            });
          }
        } catch (err) {
          console.error('处理图片失败:', err);
          setError('图片处理失败，请重试');
        } finally {
          setIsGeneratingBadge(false);
          setIsUploading(false);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [setOriginalImage, setColors, setBadge]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleClear = () => {
    reset();
    setError('');
    setIsGeneratingBadge(false);
    setIsUploading(false);
  };

  if (originalImage) {
    return (
      <div className="relative group">
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          <img
            src={originalImage}
            alt="Uploaded"
            className="w-full h-48 object-cover"
          />
          {(isUploading || isGeneratingBadge) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">
                  {isUploading ? '上传到云端...' : 'AI 生成徽章中...'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          {isUploading ? '正在上传到云端...' : isGeneratingBadge ? 'AI 生成徽章中...' : '已上传图片'}
        </p>
        {error && (
          <p className="mt-1 text-xs text-amber-600 text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            {isDragging ? (
              <ImageIcon className="w-6 h-6 text-purple-600" />
            ) : (
              <Upload className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              点击或拖拽上传图片
            </p>
            <p className="text-xs text-gray-500 mt-1">
              支持 JPG、PNG 格式，最大 10MB
            </p>
          </div>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
