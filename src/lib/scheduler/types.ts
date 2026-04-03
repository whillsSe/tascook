export interface Recipe{
  //DBから返されるJSONの型を想定。

  //レシピid
  id: string;
  //レシピ名
  name: string;
  //材料
  ingredients: Ingredient[];
  //調理手順
    /* DB上は正規化されるが、返すときは入れ子にする */
  steps: RawStep[];
}

export interface RawStep{
  //DB側に格納する手順情報
 
  //手順id
  id: string;
  //手順の概要
  label: string;
  //見込み時間
  estimatedDuration?: number;
  //作業の属性
  type?: StepType;
  //前提手順
  dependsOn: string[];
  //タイマー。ここがnullであればタイマー属性ではない、とするs
  timerTime?: number | null;
  //使用する材料
    //素材は参照idでいいはず。
  ingredients?: string[];
  //完成直前が望ましいフラグ
  isFreshnessImportant?: boolean;
  //連続手順の場合、直結idの指定
  chainParentId?: string;
  note?: Text;
}
export interface Step extends RawStep{
  //実際の評価で使うStep情報。
  //メニューid
  recipeId: string;
  type: StepType;
  estimatedDuration: number;
  timerTime: number | null;
  hasTimer: boolean;
  status: TaskStatus;
  //実績情報。調理の手順で各ユーザーの実績値の平均を取る。
  stats?: {
    averageDuration: number;
    serBestDuration?: number;
    sampleCount: number;
  }
}
export enum StepType{
  Instant = 0,  //すぐできる。混ぜる・和える・蓋を落とす・弱火に落とすなど
  Active = 1, //通常の動作。デフォルト値。切る・洗うetc
  Watch = 2,  //手を離せるけど状況が変化するもの。沸騰するまで、とか、色がつくまで煮込む。
  Passive = 3,  //手が離せる操作。煮込む・冷ます・etc...開始/完了がある
}
export type TaskStatus = 'waiting'|'ready'|'running'|'completed'
export interface CookingBlock{
  //調理順としてソート・評価する際の型

  //ブロックid。recipeId_stepId
  id: string;
  recipeId: string;
  //ワンブロック内の手順。
  steps: Step[];  //この中の並び順はisChainを反映。
  dependsOnBlockIds: string[];  //Block単位での依存関係。
  //合計時間
  estimatedDuration: number;
}
export interface Ingredient{
  id: string;
  name: string;
  amount? : string;
}