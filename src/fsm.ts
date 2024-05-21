import _debug from 'debug'
import { StateTransitions, FsmOptions } from './types'
import makeError from 'make-error'
import { waitUntil, WaitOptions } from 'prom-utils'

export const StateError = makeError('StateError')

const debug = _debug('simple-machines')

/**
 * Simple finite state machine with explicit allowed state transitions,
 * initial state, and options around how long to wait for state transitions
 * when using waitForChange as well as explicitly naming the machine for
 * better debugging when using multiple machines simultaneously.
 */
export function fsm<T extends string>(
  stateTransitions: StateTransitions<T>,
  initState: T,
  options: WaitOptions & FsmOptions<T> = {}
) {
  let state = initState
  const name = options.name || 'fsm'
  const onStateChange = options.onStateChange

  const get = () => state

  const is = (...states: T[]) => states.includes(state)

  // @ts-ignore
  const canChange = (newState: T) => stateTransitions[state]?.includes(newState)

  const _change = (newState: T) => {
    const oldState = state
    state = newState
    debug('%s changed state from %s to %s', name, oldState, newState)
    if (onStateChange) {
      onStateChange({ name, from: oldState, to: newState })
    }
  }

  const change = (newState: T) => {
    debug('%s changing state from %s to %s', name, state, newState)
    if (!canChange(newState)) {
      throw new StateError(
        `${name} invalid state transition - ${state} to ${newState}`
      )
    }
    _change(newState)
  }

  const waitForChange = (...newStates: T[]) => {
    debug(
      '%s waiting for state change from %s to %s',
      name,
      state,
      newStates.join(' or ')
    )
    return waitUntil(() => newStates.includes(state), options)
  }

  const maybeChange = (newState: T) => {
    debug('%s changing state from %s to %s', name, state, newState)
    if (canChange(newState)) {
      _change(newState)
      return true
    }
    return false
  }

  return {
    /**
     * Get the current state. Prefer `is` for checking the state.
     */
    get,
    /**
     * Transition state to `newState`. Throws if `newState` is not a valid
     * transitional state for the current state.
     */
    change,
    /**
     * Wait for state to change to one of `newStates`. Times out after 5 seconds
     * by default.
     */
    waitForChange,
    /**
     * Is state currently one of `states`?
     */
    is,
    /**
     * Can the machine be transitioned to `state`?
     */
    canChange,
    /**
     * Change states, if valid. Returns a boolean indicating if the state was changed.
     */
    maybeChange,
  }
}
