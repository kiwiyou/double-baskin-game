import { css } from '@emotion/css'
import { Link } from 'react-router-dom'

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-self: center;
  align-items: center;
`

const titleStyle = css`
  font-weight: '700';
  font-size: 7rem;
  margin: 0;
`

const buttonStyle = css`
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  font-family: 'esamanru';
  font-size: 4rem;
  transition: 1s;
  &::before {
    content: '>> ';
  }
  &:hover {
    color: hotpink;
  }
`

export const WelcomePage = () => {
  return (
    <div className={containerStyle}>
      <h1 className={titleStyle}>더블 배스킨라빈스 게임!</h1>
      <Link to="/join">
        <button className={buttonStyle}>시작</button>
      </Link>
    </div>
  )
}
