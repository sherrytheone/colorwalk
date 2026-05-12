# Color Walk 图片编辑器

一个用于生成小红书风格 Color Walk 图片的网页工具。

## 功能特性

- 🎨 自动提取图片主色调
- 🏷️ AI 生成旅行纪念徽章
- 📍 添加地理位置信息
- 📅 自动显示月份和年份
- ✨ 实时预览和导出

## 本地开发环境搭建

### 前置要求

- Node.js 18+ 
- npm 或 pnpm

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/sherrytheone/colorwalk.git
   cd colorwalk
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者使用 pnpm
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或者
   pnpm dev
   ```

4. **打开浏览器访问**
   ```
   http://localhost:5173
   ```

## 技术栈

- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (状态管理)
- html2canvas (图片导出)

## 注意事项

- 本地开发时，Vite 代理会自动处理 Seedance API 的 CORS 问题
- 部署到 Vercel 后，由于 CORS 限制，可能无法正常获取 Seedance 生成的图片
- 建议在本地环境使用以获得最佳体验

## 项目结构

```
src/
  ├── components/
  │   └── editor/          # 编辑器组件
  ├── store/               # Zustand 状态管理
  ├── utils/               # 工具函数
  └── types/               # TypeScript 类型定义
```

## License

MIT
