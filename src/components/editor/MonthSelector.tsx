import { useEditorStore } from '@/store/editorStore';
import { Calendar } from 'lucide-react';
import { MONTHS } from '@/types';

export function MonthSelector() {
  const { layoutInfo, setLayoutInfo } = useEditorStore();

  return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-purple-600" />
          <h3 className="text-sm font-medium text-gray-900">月份</h3>
        </div>
        
        <select
          value={layoutInfo.month}
          onChange={(e) => setLayoutInfo({ month: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
        >
          {MONTHS.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        
        <p className="text-xs text-gray-500">
          选择拍摄月份，将显示在图片排版中
        </p>
      </div>
  );
}
