import {processSorting, processSortingMultiMenu,} from './scheduler';
import { Recipe, Step } from "./types";
import rawData from "../data/recipes.json";
const recipesData = rawData as Recipe[];

const run = () => {
  console.log("=== スケジュール計算開始 ===");

  try {
    // ロジックの呼び出し
    const timeline = processSortingMultiMenu(shuffleRecipes(recipesData));

    if (timeline.length === 0) {
      console.warn("警告: 結果が空です。入力データかロジックを確認してください。");
      return;
    }

    console.log(`成功！ 全 ${timeline.length} 個の工程をソートしました。\n`);
    for (const step of timeline) {
      console.log(step.label);
      //sortedStep.forEach(step => {
      //  console.log(step.task);
      //})
    }
  } catch (error) {
    console.error("エラーが発生しました:");
    console.error(error);
  }

  console.log("\n=== 実行終了 ===");
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array]; // 元のデータを壊さないようコピー
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]; // 要素の入れ替え
  }
  return result;
}

function shuffleRecipes(recipes:Recipe[]) {
  recipes.forEach(recipe => {
    recipe.steps = shuffle(recipe.steps);
  })
  return recipes;
}
// 実行！
run();