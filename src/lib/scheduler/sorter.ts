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
    //sortableQueueを参照し、その中の優先順位をつける
    //それぞれのstepの重みづけをする
      //isPassiveなら、+100(最優先)
      //isPassive同士なら、durationが長いものを優先
        //それでも優先度が変わらない場合、被参照順位が高い？(手前のstepである)ものを優先する
    //その中で、重さが一番重いものを優先してsortedStepに入れる
    //sortableBlocksQueue.sort((a,b) => {
    //return calculatePriority(b) - calculatePriority(a);
    //})
    //すると、依存してた者が評価対象になるはずなので、再度forに戻る必要がある
    //現時点で優先順位が一番高いものをsortedBlockIdSetに入れる=辺を削除
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