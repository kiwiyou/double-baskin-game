import { useState } from 'react'
import { Link, Redirect, useHistory } from 'react-router-dom'
import { User } from '../common/User'

type Counter = {
  value: [number, number]
  delta: [number, number]
}

const increase = [
  updateDelta.bind(undefined, 0, 1),
  updateDelta.bind(undefined, 1, 1),
]

const decrease = [
  updateDelta.bind(undefined, 0, -1),
  updateDelta.bind(undefined, 1, -1),
]

export const GamePage = () => {
  const history = useHistory<User>()
  const [isMyTurn, setMyTurn] = useState<boolean | undefined>(true)
  const [isWin, setWin] = useState<boolean | undefined>()
  const [{ value, delta }, setCounter] = useState<Counter>({
    value: [0, 0],
    delta: [0, 0],
  })

  if (!history.location.state) {
    return <Redirect to="/" />
  }

  const other: User = {
    nickname: '대충 상대방',
  }
  const me = history.location.state

  if (isWin !== undefined) {
    return (
      <div>
        <h1>{isWin ? '승리!!' : '패배!!'}</h1>
        <Link
          to={{
            pathname: '/match',
            state: { ...me },
          }}
        >
          <button>다시 매칭하기</button>
        </Link>
        <Link to="/">
          <button>처음으로 돌아가기</button>
        </Link>
      </div>
    )
  }

  const turnIndicator =
    isMyTurn === true ? (
      <div>{me.nickname}님의 차례</div>
    ) : isMyTurn === false ? (
      <div>{other.nickname}님의 차례</div>
    ) : undefined

  const onTurnClick = () => {
    const newCounter: Counter = {
      value: [value[0] + delta[0], value[1] + delta[1]],
      delta: [0, 0],
    }
    setCounter(newCounter)
    setMyTurn((turn) => !turn)
    if (newCounter.value[0] === 31 && newCounter.value[1] === 31) {
      setWin(!isMyTurn)
    }
  }

  return (
    <div>
      {turnIndicator}
      <button onClick={() => setCounter(increase[0])}>증가</button>
      <button onClick={() => setCounter(increase[1])}>증가</button>
      <div>{value[0] + delta[0]}</div>
      <div>{value[1] + delta[1]}</div>
      <button onClick={() => setCounter(decrease[0])}>감소</button>
      <button onClick={() => setCounter(decrease[1])}>감소</button>
      <button onClick={onTurnClick}>차례 넘기기</button>
    </div>
  )
}

function updateDelta(index: number, delta: number, prev: Counter): Counter {
  const newDelta = prev.delta.map((v, i) => (i === index ? v : 0))
  newDelta[index] += delta
  if (newDelta[index] < 0) {
    newDelta[index] = 0
  } else if (newDelta[index] > 3) {
    newDelta[index] = 3
  } else if (newDelta[index] + prev.value[index] > 31) {
    newDelta[index] = 31 - prev.value[index]
  }
  return {
    value: prev.value,
    delta: newDelta as [number, number],
  }
}
