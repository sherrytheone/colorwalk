import { useRef, useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { rgbToHex, getContrastColor } from '@/utils/colorUtils';
import { Download, RefreshCw, MoveVertical } from 'lucide-react';
import html2canvas from 'html2canvas';
import { FontType } from '@/types';

// 固定上下布局组件
interface FixedLayoutProps {
  originalImage: string;
  dominantColor: string;
  textColor: string;
  badge: { imageData: string } | null;
  layoutInfo: {
    location: string;
    month: string;
    font: FontType;
    imagePosition: { x: number; y: number };
  };
  isPreview?: boolean;
  containerWidth?: number;
}

function FixedLayout({ originalImage, dominantColor, textColor, badge, layoutInfo, isPreview = false, containerWidth = 800 }: FixedLayoutProps) {
  const { setImagePosition } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [initialPositionY, setInitialPositionY] = useState(50);

  // 获取字体类名
  const getFontClass = (font: FontType) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  // 格式化月份显示（添加年份）
  const formatMonth = (month: string) => {
    return `2026, ${month}`;
  };

  // 处理图片拖动
  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isPreview) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStartY(e.clientY);
    setInitialPositionY(layoutInfo.imagePosition.y);
  }, [isPreview, layoutInfo.imagePosition.y]);

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isPreview || !isDragging) return;
    e.preventDefault();
    
    const deltaY = e.clientY - dragStartY;
    const containerHeight = containerWidth * 0.75; // 3/4 比例的一半
    const newY = Math.max(0, Math.min(100, initialPositionY + (deltaY / containerHeight) * 100));
    
    setImagePosition({ x: layoutInfo.imagePosition.x, y: newY });
  }, [isPreview, isDragging, dragStartY, initialPositionY, layoutInfo.imagePosition.x, setImagePosition, containerWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 计算徽章尺寸 - 保持正方形，最大 200px
  const badgeSize = Math.min(200, containerWidth * 0.25);

  return (
    <div 
      className="relative flex flex-col overflow-hidden"
      style={{ 
        width: containerWidth, 
        height: containerWidth * 4 / 3 // 3:4 比例
      }}
    >
      {/* 上半部分：色块 + 徽章 + 信息 (1/2) */}
      <div 
        className="flex flex-col items-center justify-center px-8 relative"
        style={{ 
          backgroundColor: dominantColor,
          height: containerWidth * 2 / 3 // 一半高度
        }}
      >
        {/* 徽章 - 上方 */}
        {badge && (
          <div className="mb-4">
            <img
              src={badge.imageData}
              alt="Badge"
              style={{
                width: badgeSize,
                height: badgeSize,
                objectFit: 'contain'
              }}
              className="drop-shadow-lg"
            />
          </div>
        )}
        
        {/* 地点和月份 - 徽章下方居中 */}
        <div className={`text-center ${getFontClass(layoutInfo.font)}`}>
          <p 
            className="font-light tracking-widest uppercase"
            style={{ 
              color: textColor,
              fontSize: containerWidth * 0.03 // 响应式字体
            }}
          >
            {layoutInfo.location || 'YOUR LOCATION'}
          </p>
          <p 
            className="mt-2 opacity-80 uppercase"
            style={{ 
              color: textColor,
              fontSize: containerWidth * 0.02
            }}
          >
            {formatMonth(layoutInfo.month)}
          </p>
        </div>
      </div>
      
      {/* 下半部分：用户图片 (1/2) - 可拖动调整位置 */}
      <div 
        className={`bg-gray-100 overflow-hidden relative ${isPreview ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        style={{ height: containerWidth * 2 / 3 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        title={isPreview ? "拖动调整图片位置" : undefined}
      >
        <img
          src={originalImage}
          alt="Main"
          className="absolute w-full h-full"
          style={{ 
            objectFit: 'cover',
            objectPosition: `center ${layoutInfo.imagePosition.y}%`,
            transition: isDragging ? 'none' : 'object-position 0.1s ease-out'
          }}
        />
        {/* 拖动提示 - 只在预览时显示 */}
        {isPreview && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
            <MoveVertical size={12} />
            拖动调整
          </div>
        )}
      </div>
    </div>
  );
}

export function PreviewCanvas() {
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const { originalImage, colors, badge, layoutInfo, reset } = useEditorStore();

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `color-walk-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    }
  }, []);

  if (!originalImage || !colors) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-center text-gray-400">
          <RefreshCw size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">上传图片开始创作</p>
          <p className="text-sm mt-2">支持 JPG、PNG 格式</p>
        </div>
      </div>
    );
  }

  const dominantColor = rgbToHex(colors.dominant);
  const textColor = getContrastColor(colors.dominant);

  // 预览容器宽度
  const previewWidth = 600;
  const exportWidth = 1200; // 导出用更高分辨率

  return (
    <div className="space-y-4">
      {/* 预览区域 - 包含拖动功能 */}
      <div className="relative flex justify-center">
        <div 
          ref={previewRef}
          className="rounded-2xl overflow-hidden shadow-2xl"
        >
          <FixedLayout 
            originalImage={originalImage}
            dominantColor={dominantColor}
            textColor={textColor}
            badge={badge}
            layoutInfo={layoutInfo}
            isPreview={true}
            containerWidth={previewWidth}
          />
        </div>
      </div>

      {/* 隐藏的导出区域 - 不包含拖动提示 */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          ref={exportRef}
        >
          <FixedLayout 
            originalImage={originalImage}
            dominantColor={dominantColor}
            textColor={textColor}
            badge={badge}
            layoutInfo={layoutInfo}
            isPreview={false}
            containerWidth={exportWidth}
          />
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Download size={18} />
          导出图片
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-purple-300 text-gray-700 rounded-xl font-medium transition-all"
        >
          <RefreshCw size={18} />
          重新开始
        </button>
      </div>
    </div>
  );
}
