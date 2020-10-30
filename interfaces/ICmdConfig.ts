export default interface ICmdConfig {
  names: string[] | string
  minArgs?: number
  maxArgs?: number
  syntaxError?: string
  expectedArgs?: string
  description?: string
  callback: Function
}
