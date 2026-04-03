import {RawStep, Step, StepType} from './types'
//RawStepをStepに変換する
export const normalizeStep = (raw:RawStep, recipeId:string) : Step => {
  const timerTime = raw.timerTime ?? (raw.type === StepType.Passive ? raw.estimatedDuration : null);
  const hasTimer = !!timerTime && timerTime > 0;
  return {
    ...raw,
    recipeId,
    type: raw.type ?? StepType.Active,
    estimatedDuration: raw.estimatedDuration ?? 0,
    chainParentId: raw.chainParentId ?? null,
    timerTime: hasTimer ? timerTime : null, // hasTimerがfalseならnullに掃除
    hasTimer,
    status: 'waiting'
  } as Step
}