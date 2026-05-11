import { Link } from 'react-router-dom';
import { Upload, Palette, Award, Download, Sparkles, Camera, MapPin, Calendar } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Palette className="w-6 h-6 text-purple-600" />,
      title: '智能提取颜色',
      description: '自动分析图片主色调，生成和谐配色方案'
    },
    {
      icon: <Award className="w-6 h-6 text-pink-600" />,
      title: '建筑徽章生成',
      description: '智能识别建筑主体，生成精美徽章图标'
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: '地理位置标记',
      description: '添加拍摄地点，记录美好旅程'
    },
    {
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      title: '月份时间戳',
      description: '自动显示当前月份，定格美好时光'
    }
  ];

  const steps = [
    { number: '01', title: '上传图片', desc: '选择你的旅行照片' },
    { number: '02', title: '自动处理', desc: '提取颜色生成徽章' },
    { number: '03', title: '编辑信息', desc: '添加地点和月份' },
    { number: '04', title: '导出分享', desc: '下载精美排版图片' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">小红书 Color Walk 风格</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              让每一张照片
              <span className="block mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                都成为艺术品
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
              上传你的旅行照片，自动提取颜色、生成建筑徽章，一键生成小红书最火的 Color Walk 风格排版图片
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all hover:-translate-y-1"
            >
              <Upload size={24} />
              开始创作
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">强大功能</h2>
            <p className="text-gray-600">简单几步，打造专业级图片排版</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">使用步骤</h2>
            <p className="text-gray-600">简单四步，轻松创作</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-purple-200 mb-3">{step.number}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Camera className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开始创作了吗？
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            无需注册，立即体验 Color Walk 图片排版工具
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <Upload size={24} />
            立即开始
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-purple-400" size={20} />
            <span className="text-white font-semibold">Color Walk</span>
          </div>
          <p className="text-sm">让每一张照片都成为艺术品</p>
        </div>
      </footer>
    </div>
  );
}
