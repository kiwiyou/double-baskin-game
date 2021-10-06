import { css } from '@emotion/css'
import { JoinForm, JoinFormProps } from './JoinForm'

const containerStyle = css`
  display: flex;
  flex-direction: column;
  align-self: center;
  align-items: center;
`

const titleStyle = css`
  font-weight: 900;
  font-size: 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
`
export interface WelcomeProps extends JoinFormProps {}

export const WelcomePage = (props: WelcomeProps) => {
  return (
    <div className={containerStyle}>
      <div className={titleStyle}>
        <div />
        <div>더</div>
        <div>블</div>
        <div>배</div>
        <div>스</div>
        <div>킨</div>
        <div>라</div>
        <div>빈</div>
        <div>스</div>
        <div>게</div>
        <div>임</div>
        <div />
      </div>
      <JoinForm {...props} />
    </div>
  )
}
