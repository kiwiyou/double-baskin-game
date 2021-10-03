import { useMachine } from '@xstate/react'
import { User } from '../common/User'
import { CounterControl } from './CounterControl'
import { IdleScene } from './IdleScene'
import { gameMachine } from './machine'

export interface GamePageProps {
  user: User
}

export const GamePage = ({ user }: GamePageProps) => {
  const [state, send] = useMachine(gameMachine, { context: { user } })

  switch (true) {
    case state.matches('idle'):
      return <IdleScene user={user} onMatch={() => send('TRY_MATCH')} />
    case state.matches({ game: 'connecting' }):
      return <h1>서버에 연결하는 중입니다...</h1>
    case state.matches({ game: 'match_waiting' }):
      return <h1>상대를 찾는 중입니다...</h1>
    case state.matches({ game: { in_game: 'my_turn' } }):
      return (
        <CounterControl
          counter={state.context.counter!}
          onTurnPass={(index, delta) => send('INCREASE', { index, delta })}
        />
      )
    case state.matches({ game: { in_game: 'other_turn' } }):
      return <h1>{state.context.opponent}님 차례입니다.</h1>
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
