import { css } from '@emotion/css'
import { useCallback, useEffect, useState } from 'react'

type TempCounter = {
  value: [number, number]
  index?: number
  delta: number
}

export interface CounterControlProps {
  counter: [number, number]
  disabled?: boolean
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

const grid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
  row-gap: 2rem;
`

export const CounterControl = ({
  counter,
  disabled = false,
  onTurnPass: onCounterSet,
}: CounterControlProps) => {
  const [tempCounter, setTempCounter] = useState<TempCounter>({
    value: counter,
    index: undefined,
    delta: 0,
  })
  const { value, index, delta } = tempCounter

  useEffect(() => {
    setTempCounter({
      value: counter,
      index: undefined,
      delta: 0,
    })
  }, [counter])

  const onTurnPass = useCallback(() => {
    if (index !== undefined && delta !== 0 && onCounterSet) {
      onCounterSet(index, delta)
    }
  }, [index, delta, onCounterSet])
  const increaseCallback = [
    useCallback(() => setTempCounter(increase[0]), [tempCounter]),
    useCallback(() => setTempCounter(increase[1]), [tempCounter]),
  ]
  const decreaseCallback = [
    useCallback(() => setTempCounter(decrease[0]), [tempCounter]),
    useCallback(() => setTempCounter(decrease[1]), [tempCounter]),
  ]

  return (
    <div className={grid}>
      <button disabled={disabled} onClick={increaseCallback[0]}>
        증가
      </button>
      <button disabled={disabled} onClick={increaseCallback[1]}>
        증가
      </button>
      <div>{value[0] + (index === 0 ? delta : 0)}</div>
      <div>{value[1] + (index === 1 ? delta : 0)}</div>
      <button disabled={disabled} onClick={decreaseCallback[0]}>
        감소
      </button>
      <button disabled={disabled} onClick={decreaseCallback[1]}>
        감소
      </button>
      <button
        className={css`
          grid-column-end: span 2;
        `}
        disabled={disabled}
        onClick={onTurnPass}
      >
        차례 넘기기
      </button>
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
