import { css, cx } from '@emotion/css'
import { DetailedHTMLProps, InputHTMLAttributes } from 'react'

const inputStyle = css`
  border: none;
  border-bottom: 2px solid white;
  background: transparent;
  padding: 0.5rem;
  color: white;
`

const wrongStyle = css`
  border-bottom-color: red;
`

export interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  wrong?: boolean
}

export const Input = (props: InputProps) => {
  const { wrong, ...others } = props
  return (
    <input
      className={cx(inputStyle, wrong === true ? wrongStyle : null)}
      {...others}
    />
  )
}
