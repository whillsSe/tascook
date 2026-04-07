import {Recipe, Step, CookingBlock,} from './types'

//TODO:stepのソートをblockに置き換えただけのもののため、重みづけやtypeによる優先順位は未実装
export const sortBlocks = (blocks: CookingBlock[]): CookingBlock[] => {
  const sortedBlocks: CookingBlock[] = [];
  const sortedBlockIdSet: Set<string> = new Set<string> ();
  while(sortedBlockIdSet.size != blocks.length){
    //whileループ内で、何らかsortedBlockIdSetに追加したかの管理用フラグ
    let isSortable = false;
    const sortableBlocksQueue: CookingBlock [] = [];
    for (const block of blocks){
      //処理済みの場合、無視
      if (sortedBlockIdSet.has(block.id)) continue;
      //dependsOnしてるstepの場合、無視
      if (hasUnresolvedDependencies(block, sortedBlockIdSet)) continue;
      //入次数0のstepについて、sortableStepsQueueに入れる
      sortableBlocksQueue.push(block);
      isSortable = true;
    }
    if (!isSortable) throw new Error("追加が行われないループに突入しています。");
    //今回は全Blockを横並びにして計算しているが、各料理の最善手を表示する、とかを構想する時にこれで良いのか問題はある。
    //今の実装は、dependsOn単位で並べてるだけな事にご注意。
    const priority_block: CookingBlock = sortableBlocksQueue.shift()!;
    sortedBlocks.push(priority_block);
    sortedBlockIdSet.add(priority_block.id);
  }
  return sortedBlocks;
}

function hasUnresolvedDependencies(block: CookingBlock, sortedStep: Set<string>){
  const dependsOn = block.dependsOnBlockIds;
  if (dependsOn.length == 0 || dependsOn.every(item => sortedStep.has(item))){
    return false;
  }
  return true;
}