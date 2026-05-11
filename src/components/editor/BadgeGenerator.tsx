import { useEditorStore } from '@/store/editorStore';
import { Award } from 'lucide-react';

export function BadgeGenerator() {
  const { badge } = useEditorStore();

  if (!badge) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-gray-400">
          <Award size={18} />
          <span className="text-sm">上传图片后将自动生成建筑徽章</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {badge.imageData ? (
        <img
          src={badge.imageData}
          alt="Badge"
          className="w-10 h-10 object-contain"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">-</span>
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-900">建筑徽章</p>
        <p className="text-xs text-gray-500">AI 自动生成</p>
      </div>
    </div>
  );
}
