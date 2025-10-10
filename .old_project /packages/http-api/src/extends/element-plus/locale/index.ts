export { default as en } from './lang/en'

export type TranslatePair = {
  [key: string]: string | string[] | TranslatePair
}

export type Language = {
  name: string
  el: TranslatePair
}
