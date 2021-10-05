import { useMachine } from '@xstate/react'
import { useCallback } from 'react'
import { User } from '../common/User'
import { CounterControl } from './CounterControl'
import { IdleScene } from './IdleScene'
import { gameMachine } from './machine'

export interface GamePageProps {
  user: User
}

export const GamePage = ({ user }: GamePageProps) => {
  const [state, send] = useMachine(gameMachine, {
    context: {
      user,
      host: `wss://${window.location.host}/server`,
    },
  })
  const onDelta = useCallback(
    (index, delta) =>
      send('DELTA', {
        index,
        delta:
          (state.context.index === index ? state.context.delta! : 0) + delta,
      }),
    [state.context]
  )
  const onTurnPass = useCallback(
    () =>
      send('PASS', {
        index: state.context.index!,
        delta: state.context.delta!,
      }),
    [state.context]
  )

  switch (true) {
    case state.matches('idle'):
      return <IdleScene user={user} onMatch={() => send('TRY_MATCH')} />
    case state.matches({ game: 'connecting' }):
      return <h1>서버에 연결하는 중입니다...</h1>
    case state.matches({ game: 'match_waiting' }):
      return <h1>상대를 찾는 중입니다...</h1>
    case state.matches({ game: { in_game: 'my_turn' } }): {
      const actualCounter: [number, number] = [
        state.context.counter![0] +
          (state.context.index === 0 ? state.context.delta! : 0),
        state.context.counter![1] +
          (state.context.index === 1 ? state.context.delta! : 0),
      ]
      return (
        <div>
          <h1>{user.nickname}님 차례입니다.</h1>
          <CounterControl
            counter={actualCounter}
            onDelta={onDelta}
            onTurnPass={onTurnPass}
          />
        </div>
      )
    }
    case state.matches({ game: { in_game: 'other_turn' } }): {
      const actualCounter: [number, number] = [
        state.context.counter![0] +
          (state.context.index === 0 ? state.context.delta! : 0),
        state.context.counter![1] +
          (state.context.index === 1 ? state.context.delta! : 0),
      ]
      return (
        <div>
          <h1>{state.context.opponent}님 차례입니다.</h1>
          <CounterControl counter={actualCounter} disabled />
        </div>
      )
    }
    case state.matches({ game: 'win' }):
      return (
        <div>
          <h1>승리!</h1>
          <button onClick={() => send('BACK_IDLE')}>다시 매칭하기</button>
        </div>
      )
    case state.matches({ game: 'lose' }):
      return (
        <div>
          <h1>패배!</h1>
          <button onClick={() => send('BACK_IDLE')}>다시 매칭하기</button>
        </div>
      )
    case state.matches({ game: 'disconnected' }):
      return (
        <div>
          <h1>서버와의 연결이 끊어졌습니다.</h1>
          <button onClick={() => send('BACK_IDLE')}>다시 매칭하기</button>
        </div>
      )
    default:
      return null
  }
}
