import { Recipe, Step } from "./types";
import rawData from "../data/recipes.json";

const recipes = rawData as Recipe[];

export function processSorting(recipes: Recipe[]) {
  const sortedStepSet:Step[][] = [];
  recipes.forEach(recipe => {
    const sorted = sortStepsByDependency(recipe);
    sortedStepSet.push(sorted);
  })
  return sortedStepSet;
}

function sortStepsByDependency(recipe: Recipe) {
  //単体のメニューについてソーティングを行う場合
  const sortedSteps: Step[] = [];
  const sortedStepIdSet: Set<string> = new Set<string> ();
  while(sortedStepIdSet.size != recipe.steps.length){
    for (const step of recipe.steps){
      //処理済みの場合、無視
      if (sortedStepIdSet.has(step.id)) continue;
      //dependsOnしてるstepの場合、無視
      if (isDependsOnAnyStep(step, sortedStepIdSet)) continue;
      //TODO:dependsOnの番号が何らかの理由で不適な値になっていた場合、while文が終了しない不具合が予想される

      //入次数0のstepについて、sortedStepsに入れる
      sortedSteps.push(step);

      //sortedStepIdSetにも入れる=辺を削除
      sortedStepIdSet.add(step.id);
    }
  }
  return sortedSteps;
}

function isDependsOnAnyStep(step: Step, sortedStep: Set<string>){
  const dependsOn = step.dependsOn;
  if (dependsOn.length == 0 || dependsOn.every(item => sortedStep.has(item))){
    return false;
  }
  return true;
}
