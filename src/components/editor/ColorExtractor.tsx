import { useEditorStore } from '@/store/editorStore';
import { rgbToHex } from '@/utils/colorUtils';
import { Palette } from 'lucide-react';

export function ColorExtractor() {
  const { colors } = useEditorStore();

  if (!colors) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-gray-400">
          <Palette size={18} />
          <span className="text-sm">上传图片后将自动提取颜色</span>
        </div>
      </div>
    );
  }

  const { dominant } = colors;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 flex-shrink-0"
        style={{ backgroundColor: rgbToHex(dominant) }}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">主色调</p>
        <p className="text-xs text-gray-500">
          {rgbToHex(dominant).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
