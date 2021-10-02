import { Redirect, useHistory } from 'react-router-dom'
import { User } from '../common/User'

export const MatchPage = () => {
  const history = useHistory<User>()

  if (!history.location.state) {
    return <Redirect to="/" />
  }

  const { nickname } = history.location.state
  const onMatchClick = () => {
    history.push('/game', { nickname })
  }

  return (
    <div>
      <h1>{nickname}님 안녕하세요!</h1>
      <button onClick={onMatchClick}>매칭 시작</button>
    </div>
  )
}
