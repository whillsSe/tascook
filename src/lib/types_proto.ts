export interface Recipe{
  //レシピid
  id: string;
  //レシピ名
  name: string;
  //材料
  ingredients: object[];
  //調理手順
  steps: RawStep[];
}
export interface RawStep{
  //DB側に格納する手順情報
 
  //手順id
  id: string;
  //手順の概要
  label: string;
  //かかる時間?
  estimatedDuration?: number;
  //手離し可能かどうか(isPassiveと同義)
  type?: 'manual' | 'passive' | 'event'
  //前提手順(idを格納)
  dependsOn: string[];
  //使用する材料
  ingredients?: string[];
  //完成直前が望ましいフラグ
  isFreshnessImportant?: boolean;
  //連続手順の場合、直結idの指定
  chainParentId?: string;
  isPassive?: boolean;
  note: Text;
}
export interface Step extends RawStep{
  //実際の評価で使うStep情報。
  type: 'manual' | 'passive' | 'event'
  estimatedDuration: number;
}
export interface Block{
  //調理順としてソート・評価する際の単位とするもの。
  id: string;
  recipeId: string;
  //ワンブロック内の手順。
  steps: Step[];
  dependsOn: string[];  //Block単位での依存関係。この中の並び順はisChainを反映
  status?: 'ready' | 'inProgress' | 'isPassive'
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