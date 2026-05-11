// 颜色类型
export interface ColorPalette {
  dominant: [number, number, number];
  palette: [number, number, number][];
}

// 徽章形状类型
export type BadgeShape = 'circle' | 'square' | 'hexagon';

// 徽章类型
export interface Badge {
  imageData: string;
  shape: BadgeShape;
  position: { x: number; y: number };
}

// 排版模板类型
export type TemplateType = 'classic' | 'split' | 'vertical';

// 字体类型
export type FontType = 'sans' | 'serif' | 'mono';

// 排版信息
export interface LayoutInfo {
  location: string;
  month: string;
  template: TemplateType;
  font: FontType;
}

// 编辑器状态
export interface EditorState {
  originalImage: string | null;
  colors: ColorPalette | null;
  badge: Badge | null;
  layoutInfo: LayoutInfo;
}

// 模板配置
export interface TemplateConfig {
  name: string;
  description: string;
}

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  classic: {
    name: '经典模板',
    description: '主图居中，色块背景，徽章右上角'
  },
  split: {
    name: '左右分割',
    description: '左侧色块+地点信息，右侧主图'
  },
  vertical: {
    name: '上下布局',
    description: '顶部主图，底部色块条带+徽章+信息'
  }
};

// 月份选项
export const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];
