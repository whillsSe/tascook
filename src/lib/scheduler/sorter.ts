import {Recipe, Step, CookingBlock,} from './types'

//TODO:stepのソートをblockに置き換えただけのもののため手を加える予定あり
//各Step進捗時の並べ替えでもこの関数を使ってBlockの並べ替えを行う
//おそらくBlockの状態を踏まえて、ReadyなBlockを優先するとか、そー言うのを組み込んだ上で、初期でもなんでも同じ状態になる様にしたい。
export const sortBlocks = (blocks: CookingBlock[]): CookingBlock[] => {
  const sortedBlocks: CookingBlock[] = [];
  const sortedBlockIdSet: Set<string> = new Set<string> ();
  const finishedBlockIdSet: Set<string> = new Set<string> ();
  while(sortedBlockIdSet.size != blocks.length){
    //whileループ内で、何らかsortedBlockIdSetに追加したかの管理用フラグ
    let isSortable = false;
    const sortableBlocksQueue: CookingBlock [] = [];
    for (const block of blocks){
      //処理済み・依存関係解決済みのBlockである場合は無視
      if (!isDependencySatisfied(block, sortedBlockIdSet)) continue;
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

function isDependencySatisfied(block: CookingBlock, completedBlockIds: Set<string>){
  //TODO:リファクタ
  //判定対象のブロックがそもそも処理済みである場合は解決済みとする。
  if (completedBlockIds.has(block.id)){
    return false;
  }
  //dependsOnしてる対象が0もしくは全てcompletedである場合はtrueを返す。
  const allDependenciesMet = block.dependsOnBlockIds.every(item => completedBlockIds.has(item));
  
  return allDependenciesMet;
}

//一旦仮置き
//Stepの状態を吸い上げ、BlockのStatus相当の情報としてならす関数
//これを用意することで、Blockに重複するステータスを持たせないorあんまり考えなくていい様にする
type AggregateStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
function getAggregateBlockStatus(steps: Step[]): AggregateStatus {
  // 1. 全てのStepが完了していれば、Blockも完了
  if (steps.every(s => (s.status == 'COMPLETED'))) {
    return 'COMPLETED';
  }

  // 2. 一つでも完了している、あるいは着手中のものがあれば進行中
  // (isStarted などのフラグがある場合や、一部完了を検知)
  if (steps.some(s => (s.status == 'COMPLETED'))) {
    return 'IN_PROGRESS';
  }

  // 3. 何も始まっていなければ待機中
  return 'WAITING';
}