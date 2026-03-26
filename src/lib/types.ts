export interface Recipe{
  id: string;
  name: string;
  ingredients: object[];
  steps: Step[];
}
export interface Step{
  id: string;
  task: string;
  duration: number;
  dependsOn: string[];
  isPassive?: boolean;
  ingredients?: string[];
  isFreshnessImportant?: boolean;
}
export interface MappedStep{
  menu_id: Recipe["id"];
  step_id: Step["id"];
}