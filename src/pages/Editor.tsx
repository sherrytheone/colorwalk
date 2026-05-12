import { ImageUploader } from '@/components/editor/ImageUploader';
import { ColorExtractor } from '@/components/editor/ColorExtractor';
import { BadgeGenerator } from '@/components/editor/BadgeGenerator';
import { LocationInput } from '@/components/editor/LocationInput';
import { MonthSelector } from '@/components/editor/MonthSelector';
import { PreviewCanvas } from '@/components/editor/PreviewCanvas';
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Editor() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
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
              <Sparkles className="text-purple-600" size={24} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Color Walk 编辑器
              </h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Editor Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              {/* 图片上传 */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">1. 上传图片</h2>
                <ImageUploader />
              </section>

              <hr className="border-gray-100" />

              {/* 自动提取信息 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="text-purple-600" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">2. 自动提取</h2>
                </div>
                <div className="space-y-3">
                  <ColorExtractor />
                  <BadgeGenerator />
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* 信息编辑 */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">3. 添加信息</h2>
                <div className="space-y-4">
                  <LocationInput />
                  <MonthSelector />
                </div>
              </section>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:col-span-8">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                  实时预览
                </h2>
                <PreviewCanvas />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
