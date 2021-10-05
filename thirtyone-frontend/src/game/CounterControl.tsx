import { css } from '@emotion/css'
import { useCallback } from 'react'

export interface CounterControlProps {
  counter: [number, number]
  disabled?: boolean
  onDelta?: (index: number, delta: number) => void
  onTurnPass?: () => void
}

const grid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
  row-gap: 2rem;
`

export const CounterControl = ({
  counter,
  disabled = false,
  onDelta,
  onTurnPass,
}: CounterControlProps) => {
  const increaseCallback = [
    useCallback(() => onDelta && onDelta(0, 1), [onDelta]),
    useCallback(() => onDelta && onDelta(1, 1), [onDelta]),
  ]
  const decreaseCallback = [
    useCallback(() => onDelta && onDelta(0, -1), [onDelta]),
    useCallback(() => onDelta && onDelta(1, -1), [onDelta]),
  ]

  return (
    <div className={grid}>
      <button disabled={disabled} onClick={increaseCallback[0]}>
        증가
      </button>
      <button disabled={disabled} onClick={increaseCallback[1]}>
        증가
      </button>
      <div>{counter[0]}</div>
      <div>{counter[1]}</div>
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
