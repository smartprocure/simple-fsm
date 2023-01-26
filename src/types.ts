export type StateTransitions<T extends string> = Record<T, T[]>

interface StateTransition<T> {
  name: string
  from: T
  to: T
}

export interface FsmOptions<T> {
  name?: string
  onStateChange?: (change: StateTransition<T>) => void
}
