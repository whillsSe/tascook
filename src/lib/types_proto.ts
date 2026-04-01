export interface Recipe{
  id: string;
  name: string;
  ingredients: object[];
  steps: RawStep[];
}
export interface RawStep{
  id: string;
  label: string;
  estimatedDuration?: number;
  type?: 'manual' | 'passive'
  dependsOn: string[];
  isPassive?: boolean;
  ingredients?: string[];
  isFreshnessImportant?: boolean;
}
export interface Step extends RawStep{
  type: 'manual' | 'passive'
  estimatedDuration: number;
}
export interface ingredient{
  id: string;
  name: string;
}
export interface MappedStep{
  menu_id: Recipe["id"];
  step_id: Step["id"];
}
export interface StepPriority{
  step: Step;
  priority: number;
}