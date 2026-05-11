import { create } from 'zustand';
import { EditorState, LayoutInfo, Badge, ColorPalette, TemplateType, FontType } from '@/types';

const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();

interface EditorStore extends EditorState {
  setOriginalImage: (image: string | null) => void;
  setColors: (colors: ColorPalette | null) => void;
  setBadge: (badge: Badge | null) => void;
  setLayoutInfo: (info: Partial<LayoutInfo>) => void;
  setFont: (font: FontType) => void;
  reset: () => void;
}

const initialState: EditorState = {
  originalImage: null,
  colors: null,
  badge: null,
  layoutInfo: {
    location: '',
    month: currentMonth,
    template: 'classic' as TemplateType,
    font: 'sans' as FontType
  }
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialState,
  
  setOriginalImage: (image) => set({ originalImage: image }),
  
  setColors: (colors) => set({ colors }),
  
  setBadge: (badge) => set({ badge }),
  
  setLayoutInfo: (info) => set((state) => ({
    layoutInfo: { ...state.layoutInfo, ...info }
  })),

  setFont: (font) => set((state) => ({
    layoutInfo: { ...state.layoutInfo, font }
  })),

  reset: () => set(initialState)
}));
