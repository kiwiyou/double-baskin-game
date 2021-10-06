import { css, cx } from '@emotion/css'
import { useMachine } from '@xstate/react'
import { useCallback } from 'react'
import { Button } from '../common/Button'
import { User } from '../common/User'
import { CounterControl } from './CounterControl'
import { gameMachine } from './machine'
import { BeatLoader } from 'react-spinners'
import { centeredFlex } from '../common/Center'

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
  const backToMatch = useCallback(() => send('BACK_TO_MATCH'), [])

  switch (true) {
    case state.matches('connecting'):
      return (
        <div
          className={cx(
            centeredFlex,
            css`
              & > * {
                margin: 0.5rem 0;
              }
            `
          )}
        >
          <BeatLoader color="white" loading />
          <div>서버에 연결하는 중입니다...</div>
        </div>
      )
    case state.matches('match_waiting'):
      return (
        <div
          className={cx(
            centeredFlex,
            css`
              & > * {
                margin: 0.5rem 0;
              }
            `
          )}
        >
          <BeatLoader color="white" loading />
          <div>상대를 찾는 중입니다...</div>
        </div>
      )
    case state.matches({ in_game: 'my_turn' }): {
      const actualCounter: [number, number] = [
        state.context.counter![0] +
          (state.context.index === 0 ? state.context.delta! : 0),
        state.context.counter![1] +
          (state.context.index === 1 ? state.context.delta! : 0),
      ]
      return (
        <div className={centeredFlex}>
          <h1>{user.nickname}님 차례입니다.</h1>
          <CounterControl
            counter={actualCounter}
            onDelta={onDelta}
            onTurnPass={onTurnPass}
          />
        </div>
      )
    }
    case state.matches({ in_game: 'other_turn' }): {
      const actualCounter: [number, number] = [
        state.context.counter![0] +
          (state.context.index === 0 ? state.context.delta! : 0),
        state.context.counter![1] +
          (state.context.index === 1 ? state.context.delta! : 0),
      ]
      return (
        <div className={centeredFlex}>
          <h1>{state.context.opponent}님 차례입니다.</h1>
          <CounterControl counter={actualCounter} disabled />
        </div>
      )
    }
    case state.matches('win'):
      return (
        <div className={centeredFlex}>
          <h1>승리!</h1>
          <CounterControl counter={state.context.counter!} disabled />
          <Button onClick={backToMatch}>다시 매칭하기</Button>
        </div>
      )
    case state.matches('lose'):
      return (
        <div className={centeredFlex}>
          <h1>패배!</h1>
          <CounterControl counter={state.context.counter!} disabled />
          <Button onClick={backToMatch}>다시 매칭하기</Button>
        </div>
      )
    case state.matches('disconnected'):
      return (
        <div className={centeredFlex}>
          <div
            className={css`
              margin-bottom: 1rem;
            `}
          >
            서버와의 연결이 끊어졌습니다.
          </div>
          <Button onClick={backToMatch}>다시 매칭하기</Button>
        </div>
      )
    default:
      return null
  }
}
