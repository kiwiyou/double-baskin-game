import { User } from './common/User'
import { WelcomePage } from './welcome/WelcomePage'
import { GamePage } from './game/GamePage'
import { useState } from 'react'
import { injectGlobal } from '@emotion/css'

injectGlobal`
  body {
    background-color: #1d2025;
    color: white;
    font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  }
`

const App = () => {
  const [user, setUser] = useState<User | null>(null)
  if (user === null) {
    return <WelcomePage onUserCreate={setUser} />
  } else {
    return <GamePage user={user} />
  }
}

export default App
