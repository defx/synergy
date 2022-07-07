export const html = (strings, ...values) => {
  return strings.reduce((a, s, i) => a + s + (values[i] || ""), "")
}
