export type StateTransitions<T extends string> = {
  [Key in T]: Exclude<T, Key>[]
}

export interface StateTransition<T> {
  name: string
  from: T
  to: T
}

export interface FsmOptions<T> {
  name?: string
  onStateChange?: (change: StateTransition<T>) => void
}
