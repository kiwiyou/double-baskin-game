import { css } from '@emotion/css'
import { JoinForm, JoinFormProps } from './JoinForm'

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

export interface WelcomeProps extends JoinFormProps {}

export const WelcomePage = (props: WelcomeProps) => {
  return (
    <div className={containerStyle}>
      <h1 className={titleStyle}>더블 배스킨라빈스 게임!</h1>
      <JoinForm {...props} />
    </div>
  )
}
