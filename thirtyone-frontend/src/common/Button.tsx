import { css, cx } from '@emotion/css'
import { ButtonHTMLAttributes, DetailedHTMLProps, ReactChildren } from 'react'

const neonBorder = css`
  color: white;
  border: 5px solid white;
  border-radius: 9999px;
  background: none;
  transition: 0.5s;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  &:hover {
    background: white;
    color: black;
  }
`

const invisibleStyle = css`
  visibility: hidden;
`

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  invisible?: boolean
}

export const Button = (props: ButtonProps) => {
  const { invisible, className, ...others } = props
  return (
    <button
      className={cx(neonBorder, className, invisible ? invisibleStyle : null)}
      {...others}
    />
  )
}
