import { assign, createMachine, forwardTo, send } from 'xstate'
import { User } from '../common/User'

type GameContext = {
  user: User
  host: string
  opponent?: undefined
  quit?: boolean
  counter?: [number, number]
}

export const gameMachine = createMachine<GameContext>({
  context: {
    user: undefined!,
    host: undefined!,
  },
  id: 'baskin',
  initial: 'idle',
  states: {
    idle: {
      on: {
        TRY_MATCH: 'game',
      },
    },
    game: {
      initial: 'connecting',
      on: {
        BACK_IDLE: 'idle',
      },
      states: {
        connecting: {
          on: {
            CONNECTED: 'match_waiting',
          },
        },
        match_waiting: {
          on: {
            NEW_MATCH: [
              {
                target: 'in_game.my_turn',
                cond: (c, e) => e.is_turn,
                actions: assign({
                  opponent: (c, e) => e.opponent,
                  counter: (c, e) => [0, 0],
                }),
              },
              {
                target: 'in_game.other_turn',
                actions: assign({
                  opponent: (c, e) => e.opponent,
                  counter: (c, e) => [0, 0],
                }),
              },
            ],
            CLOSED: 'disconnected',
          },
        },
        in_game: {
          states: {
            my_turn: {
              on: {
                UPDATE_COUNTER: {
                  target: 'other_turn',
                  actions: assign({ counter: (c, e) => e.counter }),
                },
                INCREASE: {
                  actions: forwardTo('socket'),
                },
              },
            },
            other_turn: {
              on: {
                UPDATE_COUNTER: {
                  target: 'my_turn',
                  actions: assign({ counter: (c, e) => e.counter }),
                },
              },
            },
          },
          on: {
            CLOSED: 'disconnected',
            WIN: {
              target: 'win',
              actions: assign({ quit: (c, e) => e.quit }),
            },
            LOSE: 'lose',
          },
        },
        win: {},
        lose: {},
        disconnected: {},
      },
      invoke: {
        id: 'socket',
        src: (context, event) => (callback, onReceive) => {
          onReceive((e) => {
            switch (e.type) {
              case 'INCREASE':
                console.log(e.index, e.delta)
                sendPacket({
                  type: 'increase',
                  index: e.index,
                  delta: e.delta,
                })
                break
            }
          })

          const ws = new WebSocket(context.host)

          const sendPacket = (data: any) => {
            ws.send(JSON.stringify(data))
          }

          ws.addEventListener('open', () => {
            callback('CONNECTED')
            sendPacket({
              type: 'hello',
              name: context.user.nickname,
            })
          })

          ws.addEventListener('close', () => {
            callback('CLOSED')
          })

          ws.addEventListener('error', () => {
            callback('CLOSED')
          })

          ws.addEventListener('message', (e) => {
            if (typeof e.data === 'string') {
              const data: ClientBound = JSON.parse(e.data)
              switch (data.type) {
                case 'new_match':
                  callback({
                    type: 'NEW_MATCH',
                    opponent: data.opponent,
                    is_turn: data.is_turn,
                  })
                  break
                case 'update_counter':
                  callback({
                    type: 'UPDATE_COUNTER',
                    counter: data.counter,
                  })
                  break
                case 'win':
                  callback({ type: 'WIN', quit: data.quit })
                  break
                case 'lose':
                  callback({ type: 'LOSE' })
              }
            }
          })
          return () => ws.close()
        },
      },
    },
  },
})

interface Packet {
  type: string
}

interface NewMatchPacket extends Packet {
  type: 'new_match'
  opponent: string
  is_turn: boolean
}

interface UpdateCounterPacket extends Packet {
  type: 'update_counter'
  counter: [number, number]
}

interface WinPacket extends Packet {
  type: 'win'
  quit: boolean
}

interface LosePacket extends Packet {
  type: 'lose'
}

type ClientBound = NewMatchPacket | UpdateCounterPacket | WinPacket | LosePacket
