import { useEditorStore } from '@/store/editorStore';
import { LayoutTemplate } from 'lucide-react';
import { TEMPLATES, TemplateType } from '@/types';

export function TemplateSelector() {
  const { layoutInfo, setLayoutInfo } = useEditorStore();

  return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutTemplate size={18} className="text-purple-600" />
          <h3 className="text-sm font-medium text-gray-900">排版模板</h3>
        </div>
        
        <div className="space-y-2">
          {(Object.keys(TEMPLATES) as TemplateType[]).map((template) => (
            <button
              key={template}
              onClick={() => setLayoutInfo({ template })}
              className={`
                w-full p-3 rounded-lg border-2 text-left transition-all
                ${layoutInfo.template === template
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:border-purple-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    layoutInfo.template === template ? 'text-purple-700' : 'text-gray-900'
                  }`}>
                    {TEMPLATES[template].name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TEMPLATES[template].description}
                  </p>
                </div>
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${layoutInfo.template === template
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                  }
                `}>
                  {layoutInfo.template === template && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
  );
}
