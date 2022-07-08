export const partials = {}

export const partial = (name, html) => {
  // @todo: validate name is hyphenated
  partials[name.toUpperCase()] = html
}
