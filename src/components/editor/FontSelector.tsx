import { useEditorStore } from '@/store/editorStore';
import { FontType } from '@/types';
import { Type } from 'lucide-react';

const FONT_OPTIONS: { value: FontType; label: string; className: string }[] = [
  { value: 'sans', label: '无衬线', className: 'font-sans' },
  { value: 'serif', label: '衬线', className: 'font-serif' },
  { value: 'mono', label: '等宽', className: 'font-mono' }
];

export function FontSelector() {
  const { layoutInfo, setFont } = useEditorStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Type size={18} className="text-purple-600" />
        <h3 className="text-sm font-medium text-gray-900">字体样式</h3>
      </div>

      <div className="flex gap-2">
        {FONT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFont(option.value)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm transition-all
              ${layoutInfo.font === option.value
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-200'
              }
            `}
          >
            <span className={option.className}>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
