import {Step, CookingBlock} from './types'
  /**
   * stepをchainParentIdを参照してブロックにする
   * dependsOnがある場合、Block同士もdependsOnで繋ぐ
   */
export const createBlocks = (steps: Step[]): CookingBlock[] => {
  // 親のidから子のStepを引けるMapを作成
  const nextStepMap = new Map<string, Step>(); // [親ID, 子ID]
  steps.forEach(s => {
    if (s.chainParentId) nextStepMap.set(s.chainParentId, s);
  });

  const blocks: CookingBlock[] = [];
  const visited = new Set<string>();
  const stepIdToBlockId = new Map<string, string>();

  // 各stepについて処理
  steps.forEach(step => {
    if (visited.has(step.id)) return;

    // 「連鎖の先頭」を見つける（親がいない、または親が自分と同じレシピ内にいない）
    if (!step.chainParentId) {
      const currentBlockSteps: Step[] = [];
      let cursor: Step | undefined = step;
      // ブロックIdを確定させる
      const blockId = `blk_${step.recipeId}_${step.id}`;
      // 数珠つなぎを末尾まで辿る
      while (cursor) {
        currentBlockSteps.push(cursor);
        visited.add(cursor.id);
        stepIdToBlockId.set(cursor.id, blockId);
        // 「自分を親として指している子」を探す
        cursor = nextStepMap.get(cursor.id);
      }

      blocks.push({
        id: blockId,
        recipeId: step.recipeId,
        steps: currentBlockSteps,
        dependsOnBlockIds: [], //あとで
        estimatedDuration: 0, //あとで
      } as CookingBlock);
    }
  });

  // TODO:将来的にここのstep->blockのプロパティの吸い上げ・反映は関数を分ける
  return blocks.map(block => {
    const blockDeps = new Set<string>();
    let summedDurations = 0;

    block.steps.forEach(step => {
      summedDurations += step.estimatedDuration
      step.dependsOn?.forEach(depStepId => {
        const targetBlockId = stepIdToBlockId.get(depStepId);
        // 依存先が「自分自身（同じブロック）」以外なら、Block ID として登録
        if (targetBlockId && targetBlockId !== block.id) {
          blockDeps.add(targetBlockId);
        }
      });
    });

    return {
      ...block,
      dependsOnBlockIds: Array.from(blockDeps),
      estimatedDuration: summedDurations
    };
  })
};