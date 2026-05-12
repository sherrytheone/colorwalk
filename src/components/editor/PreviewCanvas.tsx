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
}

function FixedLayout({ originalImage, dominantColor, textColor, badge, layoutInfo, isPreview = false }: FixedLayoutProps) {
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
    const containerHeight = 400;
    const newY = Math.max(0, Math.min(100, initialPositionY + (deltaY / containerHeight) * 100));
    
    setImagePosition({ x: layoutInfo.imagePosition.x, y: newY });
  }, [isPreview, isDragging, dragStartY, initialPositionY, layoutInfo.imagePosition.x, setImagePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative w-full aspect-[3/4] flex flex-col overflow-hidden">
      {/* 上半部分：色块 + 徽章 + 信息 (1/2) */}
      <div 
        className="h-1/2 flex flex-col items-center justify-center px-8 relative"
        style={{ backgroundColor: dominantColor }}
      >
        {/* 徽章 - 上方 */}
        {badge && (
          <div className="mb-4">
            <img
              src={badge.imageData}
              alt="Badge"
              className="w-64 h-64 object-contain drop-shadow-lg"
            />
          </div>
        )}
        
        {/* 地点和月份 - 徽章下方居中 */}
        <div className={`text-center ${getFontClass(layoutInfo.font)}`}>
          <p 
            className="text-xl font-light tracking-widest uppercase"
            style={{ color: textColor }}
          >
            {layoutInfo.location || 'YOUR LOCATION'}
          </p>
          <p 
            className="text-sm mt-2 opacity-80 uppercase"
            style={{ color: textColor }}
          >
            {formatMonth(layoutInfo.month)}
          </p>
        </div>
      </div>
      
      {/* 下半部分：用户图片 (1/2) - 可拖动调整位置 */}
      <div 
        className={`h-1/2 bg-gray-100 overflow-hidden relative ${isPreview ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        title={isPreview ? "拖动调整图片位置" : undefined}
      >
        <img
          src={originalImage}
          alt="Main"
          className="absolute w-full h-full object-cover"
          style={{ 
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

  return (
    <div className="space-y-4">
      {/* 预览区域 - 包含拖动功能 */}
      <div className="relative">
        <div 
          ref={previewRef}
          className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
        >
          <FixedLayout 
            originalImage={originalImage}
            dominantColor={dominantColor}
            textColor={textColor}
            badge={badge}
            layoutInfo={layoutInfo}
            isPreview={true}
          />
        </div>
      </div>

      {/* 隐藏的导出区域 - 不包含拖动提示 */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          ref={exportRef}
          className="w-[800px] rounded-2xl overflow-hidden"
          style={{ aspectRatio: '3/4' }}
        >
          <FixedLayout 
            originalImage={originalImage}
            dominantColor={dominantColor}
            textColor={textColor}
            badge={badge}
            layoutInfo={layoutInfo}
            isPreview={false}
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
