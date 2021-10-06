import { css } from '@emotion/css'
import { useState, UIEvent } from 'react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { User } from '../common/User'

const formStyle = css`
  width: 15rem;
  display: flex;
  font-size: 1rem;
  flex-direction: column;
  & > * {
    margin: 0.5rem 0;
  }
  margin-top: 2rem;
`

const errorStyle = css`
  color: red;
  text-align: center;
`

export interface JoinFormProps {
  onUserCreate?: (user: User) => void
}

enum NicknameError {
  Empty,
  TooLong,
}

const MAX_NICKNAME_LEN = 20

const NicknameErrorMsg = {
  [NicknameError.Empty]: '별명이 빈 칸입니다.',
  [NicknameError.TooLong]: `별명은 ${MAX_NICKNAME_LEN}자를 넘을 수 없습니다.`,
}

export const JoinForm = ({ onUserCreate }: JoinFormProps) => {
  const [nickname, setNickname] = useState('')
  const [nickError, setNickError] = useState<NicknameError | undefined>()

  const onConfirm = (e: UIEvent) => {
    e.preventDefault()
    const result = filterNickname(nickname)
    if (typeof result === 'string') {
      if (onUserCreate) {
        onUserCreate({ nickname: result })
      }
    } else {
      setNickError(result)
    }
  }

  const errorLabel =
    nickError !== undefined ? (
      <label htmlFor="nickname">{NicknameErrorMsg[nickError]}</label>
    ) : undefined

  return (
    <form className={formStyle}>
      <Input
        id="nickname"
        name="nickname"
        placeholder="별명"
        maxLength={20}
        onChange={(e) => setNickname(e.target.value)}
        wrong={nickError !== undefined}
      />
      <div className={errorStyle}>{errorLabel}</div>
      <Button type="submit" onClick={onConfirm}>
        게임 시작하기
      </Button>
    </form>
  )
}

function filterNickname(nickname: string): string | NicknameError {
  const trimmed = nickname.trim()
  if (trimmed.length <= 0) {
    return NicknameError.Empty
  } else if (trimmed.length > MAX_NICKNAME_LEN) {
    return NicknameError.TooLong
  } else {
    return trimmed
  }
}
