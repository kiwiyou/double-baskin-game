import { injectGlobal } from '@emotion/css'
import { User } from './common/User'
import { WelcomePage } from './welcome/WelcomePage'
import { GamePage } from './game/GamePage'
import { useState } from 'react'

injectGlobal`
  body {
    background-color: black;
    color: #bbb;
    font-family: 'esamanru';
    overflow: hidden;
  }

  html, body {
    margin: 0;
    padding: 0;
  }

  #root {
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
    justify-content: center;
  }
`

const App = () => {
  const [user, setUser] = useState<User | undefined>(undefined)
  if (user === undefined) {
    return <WelcomePage onUserCreate={setUser} />
  } else {
    return <GamePage user={user} />
  }
}

export default App
