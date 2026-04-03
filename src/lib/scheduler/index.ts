import {Recipe, RawStep, Step, StepType, CookingBlock} from './types'
import {normalizeStep} from './normalizer'
import {createBlocks} from './factory'
import {sortBlocks} from './sorter'
/**
 * 複数のレシピを受け取り、最適化された手順の配列を返すメイン関数
 */
export const run_scheduler = (rawRecipes: Recipe[]): Step[] => {
  // ① 【バラして変換】 レシピ(配列) -> Stepの配列
  const allSteps: Step[] = rawRecipes.flatMap(recipe => 
    recipe.steps.map(raw => normalizeStep(raw, recipe.id))
  );

  // ② 【構造化】 Stepの配列 -> Blockの配列
  const blocks = createBlocks(allSteps);

  // ③ 【ソート】 優先順位に基づいて並び替え
  const sortedBlocks = sortBlocks(blocks);

  // ④ 【フラット化】 Blockの配列 -> Stepの配列（UI用）
  return sortedBlocks.flatMap(block => block.steps);
};