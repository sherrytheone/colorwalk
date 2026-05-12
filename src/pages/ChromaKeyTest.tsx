import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, Download, RefreshCw, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChromaKeyTest() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 抠图参数
  const [targetR, setTargetR] = useState(158);
  const [targetG, setTargetG] = useState(254);
  const [targetB, setTargetB] = useState(84);
  const [shadowTolerance, setShadowTolerance] = useState(100);
  const [greenDominantThreshold, setGreenDominantThreshold] = useState(20);

  // 处理图片上传
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // 执行抠图
  const processChromaKey = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 抠图算法
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 计算与目标荧光绿的欧几里得距离
        const distance = Math.sqrt(
          Math.pow(r - targetR, 2) +
          Math.pow(g - targetG, 2) +
          Math.pow(b - targetB, 2)
        );

        // 检查是否是绿色主导的颜色
        const isGreenDominant = g > r + greenDominantThreshold && g > b + greenDominantThreshold;
        const isNearGreenScreen = distance < shadowTolerance;

        if (isNearGreenScreen && isGreenDominant) {
          // 设置为透明
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
    img.src = originalImage;
  }, [originalImage, targetR, targetG, targetB, shadowTolerance, greenDominantThreshold]);

  // 下载处理后的图片
  const handleDownload = useCallback(() => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.download = `chroma-key-${Date.now()}.png`;
    link.href = processedImage;
    link.click();
  }, [processedImage]);

  // 重置
  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">返回首页</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Settings className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                绿幕抠图测试
              </h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* 图片上传 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. 上传图片</h2>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                <Upload className="text-gray-400 mb-2" size={32} />
                <span className="text-sm text-gray-500">点击上传带绿幕的图片</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 参数调整 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. 调整参数</h2>
              
              {/* 目标颜色 */}
              <div className="space-y-4 mb-6">
                <label className="text-sm font-medium text-gray-700">目标颜色 (RGB)</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">R</label>
                    <input
                      type="number"
                      value={targetR}
                      onChange={(e) => setTargetR(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      min="0"
                      max="255"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">G</label>
                    <input
                      type="number"
                      value={targetG}
                      onChange={(e) => setTargetG(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      min="0"
                      max="255"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">B</label>
                    <input
                      type="number"
                      value={targetB}
                      onChange={(e) => setTargetB(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      min="0"
                      max="255"
                    />
                  </div>
                </div>
                <div 
                  className="w-full h-8 rounded-lg border border-gray-200"
                  style={{ backgroundColor: `rgb(${targetR}, ${targetG}, ${targetB})` }}
                />
              </div>

              {/* 容差 */}
              <div className="space-y-4 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  颜色容差: {shadowTolerance}
                </label>
                <input
                  type="range"
                  value={shadowTolerance}
                  onChange={(e) => setShadowTolerance(Number(e.target.value))}
                  className="w-full"
                  min="50"
                  max="200"
                  step="5"
                />
                <p className="text-xs text-gray-500">值越大，去除的绿色范围越广（包括投影）</p>
              </div>

              {/* 绿色主导阈值 */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  绿色主导阈值: {greenDominantThreshold}
                </label>
                <input
                  type="range"
                  value={greenDominantThreshold}
                  onChange={(e) => setGreenDominantThreshold(Number(e.target.value))}
                  className="w-full"
                  min="0"
                  max="50"
                  step="5"
                />
                <p className="text-xs text-gray-500">绿色通道需要比红蓝通道强多少才算绿色</p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
              <button
                onClick={processChromaKey}
                disabled={!originalImage || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    处理中...
                  </>
                ) : (
                  <>
                    <Settings size={18} />
                    执行抠图
                  </>
                )}
              </button>

              {processedImage && (
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
                >
                  <Download size={18} />
                  下载结果
                </button>
              )}

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-medium transition-all"
              >
                <RefreshCw size={18} />
                重新开始
              </button>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">预览对比</h2>
              
              {!originalImage ? (
                <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="text-center text-gray-400">
                    <Upload size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">上传图片开始测试</p>
                    <p className="text-sm mt-2">支持带荧光绿背景的图片</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 原图 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">原图</h3>
                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* 抠图结果 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">抠图结果</h3>
                    <div 
                      className="relative aspect-square rounded-xl overflow-hidden"
                      style={{ 
                        backgroundImage: `
                          linear-gradient(45deg, #ccc 25%, transparent 25%),
                          linear-gradient(-45deg, #ccc 25%, transparent 25%),
                          linear-gradient(45deg, transparent 75%, #ccc 75%),
                          linear-gradient(-45deg, transparent 75%, #ccc 75%)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}
                    >
                      {processedImage ? (
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <p className="text-sm">点击"执行抠图"查看结果</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
