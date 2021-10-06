import { css } from '@emotion/css'
import { useCallback } from 'react'
import { Button } from '../common/Button'

export interface CounterControlProps {
  counter: [number, number]
  disabled?: boolean
  onDelta?: (index: number, delta: number) => void
  onTurnPass?: () => void
}

const counterStyle = css`
  font-size: 5rem;
  font-variant-numeric: tabular-nums;
  font-style: italic;
  font-weight: 700;
`

const grid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
  gap: 2rem;
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
      <Button
        invisible={disabled}
        disabled={disabled}
        onClick={increaseCallback[0]}
      >
        증가
      </Button>
      <Button
        invisible={disabled}
        disabled={disabled}
        onClick={increaseCallback[1]}
      >
        증가
      </Button>
      <div className={counterStyle}>{counter[0]}</div>
      <div className={counterStyle}>{counter[1]}</div>
      <Button
        invisible={disabled}
        disabled={disabled}
        onClick={decreaseCallback[0]}
      >
        감소
      </Button>
      <Button
        invisible={disabled}
        disabled={disabled}
        onClick={decreaseCallback[1]}
      >
        감소
      </Button>
      <Button
        className={css`
          grid-column-end: span 2;
          font-size: 1.5rem;
          padding: 1rem 1.5rem;
        `}
        invisible={disabled}
        disabled={disabled}
        onClick={onTurnPass}
      >
        차례 넘기기
      </Button>
    </div>
  )
}
