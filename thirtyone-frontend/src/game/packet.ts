export interface Packet {
  type: string
}

export interface MatchPacket extends Packet {
  type: 'match'
  opponent: string
  is_turn: boolean
}

export interface DeltaPacket extends Packet {
  type: 'delta'
  index: number
  delta: number
}

export interface PassPacket extends Packet {
  type: 'pass'
  counter: [number, number]
}

export interface WinPacket extends Packet {
  type: 'win'
  quit: boolean
}

export interface LosePacket extends Packet {
  type: 'lose'
}

export type ClientBound =
  | MatchPacket
  | DeltaPacket
  | PassPacket
  | WinPacket
  | LosePacket
