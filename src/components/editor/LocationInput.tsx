import { useEditorStore } from '@/store/editorStore';
import { MapPin } from 'lucide-react';

export function LocationInput() {
  const { layoutInfo, setLayoutInfo } = useEditorStore();

  return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-purple-600" />
          <h3 className="text-sm font-medium text-gray-900">地理位置</h3>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={layoutInfo.location}
            onChange={(e) => setLayoutInfo({ location: e.target.value })}
            placeholder="输入地点名称，如：Santa Casa da Misericórdia"
            className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        
        <p className="text-xs text-gray-500">
          输入拍摄地点，将显示在图片排版中
        </p>
      </div>
  );
}
