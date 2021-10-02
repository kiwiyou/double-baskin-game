import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { GamePage, JoinPage, MatchPage, WelcomePage } from './pages'
import { injectGlobal } from '@emotion/css'

injectGlobal`
  @import url('https://cdn.jsdelivr.net/gh/naen-nae/fonts/build/css/esamanru.css');

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
  return (
    <Router>
      <Switch>
        <Route path="/game">
          <GamePage />
        </Route>
        <Route path="/match">
          <MatchPage />
        </Route>
        <Route path="/join">
          <JoinPage />
        </Route>
        <Route path="/">
          <WelcomePage />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
