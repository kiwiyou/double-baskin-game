import { User } from '../common/User'

export interface IdleSceneProps {
  user: User
  onMatch?: () => void
}

export const IdleScene = ({ user, onMatch }: IdleSceneProps) => {
  return (
    <div>
      <h1>{user.nickname}님 안녕하세요!</h1>
      <button onClick={onMatch}>매칭 시작하기</button>
    </div>
  )
}
