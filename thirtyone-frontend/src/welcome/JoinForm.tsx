import { useState, UIEvent } from 'react'
import { User } from '../common/User'

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
    <form>
      <h1>게임에서 사용할 별명을 입력해주세요.</h1>
      <input
        id="nickname"
        name="nickname"
        placeholder="별명"
        maxLength={20}
        onChange={(e) => setNickname(e.target.value)}
      />
      {errorLabel}
      <button type="submit" onClick={onConfirm}>
        확인
      </button>
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
