import { useRef, useState, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ColorPalette } from '@/types';
import { Pipette } from 'lucide-react';

export function ColorPicker() {
  const { originalImage, setColors } = useEditorStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [previewColor, setPreviewColor] = useState<string | null>(null);

  // 加载图片到 canvas
  useEffect(() => {
    if (!isPicking || !originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 限制 canvas 大小以提高性能
      const maxWidth = 400;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = originalImage;
  }, [isPicking, originalImage]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算缩放比例
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
    const rgb: [number, number, number] = [pixel[0], pixel[1], pixel[2]];

    // 更新主色调
    const newColors: ColorPalette = {
      dominant: rgb,
      palette: [rgb]
    };
    setColors(newColors);
    setIsPicking(false);
    setPreviewColor(null);
  }, [originalImage, setColors]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isPicking) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pixelX = Math.floor(x * scaleX);
    const pixelY = Math.floor(y * scaleY);

    const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;
    setPreviewColor(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`);
  }, [isPicking]);

  if (!originalImage) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">图片拾色器</label>
        <button
          onClick={() => setIsPicking(!isPicking)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isPicking
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Pipette size={16} />
          {isPicking ? '点击取色' : '开启取色'}
        </button>
      </div>

      {isPicking && (
        <div className="relative">
          <p className="text-xs text-gray-500 mb-2">点击图片任意位置提取颜色</p>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="w-full rounded-lg cursor-crosshair border-2 border-purple-300"
            style={{ maxHeight: '200px', objectFit: 'contain' }}
          />
          {previewColor && (
            <div
              className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: previewColor }}
            />
          )}
        </div>
      )}
    </div>
  );
}
