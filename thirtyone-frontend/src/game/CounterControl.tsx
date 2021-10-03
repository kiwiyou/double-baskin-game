import { useState } from 'react'

type TempCounter = {
  value: [number, number]
  index?: number
  delta: number
}

export interface CounterControlProps {
  counter: [number, number]
  onTurnPass?: (index: number, delta: number) => void
}

const increase = [
  updateCounter.bind(undefined, 0, 1),
  updateCounter.bind(undefined, 1, 1),
]

const decrease = [
  updateCounter.bind(undefined, 0, -1),
  updateCounter.bind(undefined, 1, -1),
]

export const CounterControl = ({
  counter,
  onTurnPass: onCounterSet,
}: CounterControlProps) => {
  const [{ value, index, delta }, setTempCounter] = useState<TempCounter>({
    value: counter,
    index: undefined,
    delta: 0,
  })

  const onTurnPass = () => {
    if (index !== undefined && delta !== 0 && onCounterSet) {
      onCounterSet(index, delta)
    }
  }

  return (
    <div>
      <button onClick={() => setTempCounter(increase[0])}>증가</button>
      <button onClick={() => setTempCounter(increase[1])}>증가</button>
      <div>{value[0] + (index === 0 ? delta : 0)}</div>
      <div>{value[1] + (index === 1 ? delta : 0)}</div>
      <button onClick={() => setTempCounter(decrease[0])}>감소</button>
      <button onClick={() => setTempCounter(decrease[1])}>감소</button>
      <button onClick={onTurnPass}>차례 넘기기</button>
    </div>
  )
}

function updateCounter(
  index: number,
  delta: number,
  prev: TempCounter
): TempCounter {
  const newCounter: TempCounter = {
    value: prev.value,
    index,
    delta: 0,
  }
  if (prev.index === index) {
    newCounter.delta = prev.delta
  }
  newCounter.delta += delta
  if (newCounter.delta < 0) {
    newCounter.delta = 0
  } else if (newCounter.delta > 3) {
    newCounter.delta = 3
  } else if (newCounter.delta + newCounter.value[newCounter.index!] > 31) {
    newCounter.delta = 31 - newCounter.value[newCounter.index!]
  }
  return newCounter
}
