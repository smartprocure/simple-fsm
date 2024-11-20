export type StateTransitions<T extends string> = Record<T, T[]>

export interface StateTransition<T> {
  /** Arbitrary text describing the FSM. */
  name: string
  /** State transitioned from. */
  from: T
  /** State transitioned to. */
  to: T
  /** The elapsed time in ms the FSM was in the from state. */
  elapsedTime: number
}

export interface FsmOptions<T> {
  /** Arbitrary text describing the FSM. */
  name?: string
  /** Called for every successful state change. */
  onStateChange?: (change: StateTransition<T>) => void
}
