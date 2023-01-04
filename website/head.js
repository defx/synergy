const HEAD_OPEN = "<head>"
const HEAD_CLOSE = "</head>"

export const decapitate = (str) => {
  const start = str.indexOf(HEAD_OPEN)
  const end = str.indexOf(HEAD_CLOSE)
  if (start === -1)
    return {
      head: "",
      body: str,
    }
  return {
    head: str.slice(start + HEAD_OPEN.length, end).trim(),
    body:
      str.slice(0, start).trim() + str.slice(end + HEAD_CLOSE.length).trim(),
  }
}
