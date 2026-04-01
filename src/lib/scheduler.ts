import { Recipe, Step , StepPriority} from "./types";
import rawData from "../data/recipes.json";

const recipes = rawData as Recipe[];

export function processSorting(recipes: Recipe[]) {
  const sortedStepSet:Step[][] = [];
  recipes.forEach(recipe => {
    //const sorted = sortStepsByDependency(recipe);
    const sorted = sortStepsByDependencyAndPriority(recipe);
    sortedStepSet.push(sorted);
  })
  return sortedStepSet;
}
export function processSortingMultiMenu(recipes: Recipe[]) {
  return sortMultiMenuStepsByDependencyAndPriority(recipes);
}

function sortStepsByDependency(recipe: Recipe) {
  //単体のメニューについてソーティングを行う場合
  const sortedSteps: Step[] = [];
  const sortedStepIdSet: Set<string> = new Set<string> ();
  while(sortedStepIdSet.size != recipe.steps.length){
    //whileループ内で、何らかsortedStepIdSetに追加したかの管理用フラグ
    let hasAdded = false;
    for (const step of recipe.steps){
      //処理済みの場合、無視
      if (sortedStepIdSet.has(step.id)) continue;
      //dependsOnしてるstepの場合、無視
      if (hasUnresolvedDependencies(step, sortedStepIdSet)) continue;

      //入次数0のstepについて、sortedStepsに入れる
      sortedSteps.push(step);

      //sortedStepIdSetにも入れる=辺を削除
      sortedStepIdSet.add(step.id);
      //ソートしたのでフラグを有効に
      hasAdded = true;
    }
    if (!hasAdded) {
      throw new Error("追加が行われないループに突入しています。");
    }
  }
  return sortedSteps;
}

function sortStepsByDependencyAndPriority(recipe: Recipe) {
  //単体のメニューについてソーティングを行う場合
  const sortedSteps: Step[] = [];
  const sortedStepIdSet: Set<string> = new Set<string> ();
  while(sortedStepIdSet.size != recipe.steps.length){
    //whileループ内で、何らかsortedStepIdSetに追加したかの管理用フラグ
    let isSortable = false;
    const sortableStepsQueue: Step [] = [];
    for (const step of recipe.steps){
      //処理済みの場合、無視
      if (sortedStepIdSet.has(step.id)) continue;
      //dependsOnしてるstepの場合、無視
      if (hasUnresolvedDependencies(step, sortedStepIdSet)) continue;
      //入次数0のstepについて、sortableStepsQueueに入れる
      sortableStepsQueue.push(step);
      isSortable = true;
    }
    if (!isSortable) throw new Error("追加が行われないループに突入しています。");
    //sortableQueueを参照し、その中の優先順位をつける
    //それぞれのstepの重みづけをする
      //isPassiveなら、+100(最優先)
      //isPassive同士なら、durationが長いものを優先
        //それでも優先度が変わらない場合、被参照順位が高い？(手前のstepである)ものを優先する
    //その中で、重さが一番重いものを優先してsortedStepに入れる
    sortableStepsQueue.sort((a,b) => {
      return calculatePriority(b) - calculatePriority(a);
    })
    //すると、依存してた者が評価対象になるはずなので、再度forに戻る必要がある
    //現時点で優先順位が一番高いものをsortedStepIdSetに入れる=辺を削除
    const priority_step: Step = sortableStepsQueue.shift()!;
    sortedSteps.push(priority_step);
    sortedStepIdSet.add(priority_step.id);
  }
  return sortedSteps;
}

function sortMultiMenuStepsByDependencyAndPriority(recipes: Recipe[]) {
  //複数のメニューについてソーティングを行う
  const flattenedSteps = recipes.flatMap(recipe => 
  recipe.steps.map(step => ({
    ...step,
    id: `${recipe.id}_${step.id}`, // "anpan_knead"
    dependsOn: step.dependsOn.map(d => `${recipe.id}_${d}`) // 依存先も書き換える
  }))
);
  const sortedSteps: Step[] = [];
  const sortedStepIdSet: Set<string> = new Set<string> ();
  while(sortedStepIdSet.size != flattenedSteps.length){
    //whileループ内で、何らかsortedStepIdSetに追加したかの管理用フラグ
    let isSortable = false;
    const sortableStepsQueue: Step [] = [];
    for (const step of flattenedSteps){
      //処理済みの場合、無視
      if (sortedStepIdSet.has(step.id)) continue;
      //dependsOnしてるstepの場合、無視
      if (hasUnresolvedDependencies(step, sortedStepIdSet)) continue;
      //入次数0のstepについて、sortableStepsQueueに入れる
      sortableStepsQueue.push(step);
      isSortable = true;
    }
    if (!isSortable) throw new Error("追加が行われないループに突入しています。");
    //sortableQueueを参照し、その中の優先順位をつける
    //それぞれのstepの重みづけをする
      //isPassiveなら、+100(最優先)
      //isPassive同士なら、durationが長いものを優先
        //それでも優先度が変わらない場合、被参照順位が高い？(手前のstepである)ものを優先する
    //その中で、重さが一番重いものを優先してsortedStepに入れる
    sortableStepsQueue.sort((a,b) => {
      return calculatePriority(b) - calculatePriority(a);
    })
    //すると、依存してた者が評価対象になるはずなので、再度forに戻る必要がある
    //現時点で優先順位が一番高いものをsortedStepIdSetに入れる=辺を削除
    const priority_step: Step = sortableStepsQueue.shift()!;
    sortedSteps.push(priority_step);
    sortedStepIdSet.add(priority_step.id);
  }
  return sortedSteps;
}

function calculatePriority(step: Step) {
  let priority = 0;
  //ながら作業可能な場合、最優先
  if (step.isPassive) {
    priority += 100;
  }
  //そのステップにかかる時間が長いものを優先
  priority += (step.estimatedDuration ?? 0);
  //後続タスクの多さなどの優先度を評価するならここに追加？
  return priority;
}

function hasUnresolvedDependencies(step: Step, sortedStep: Set<string>){
  const dependsOn = step.dependsOn;
  if (dependsOn.length == 0 || dependsOn.every(item => sortedStep.has(item))){
    return false;
  }
  return true;
}
