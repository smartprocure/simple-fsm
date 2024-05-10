import { fsm } from './fsm'
import { StateTransitions } from './types'

type State = 'starting' | 'started' | 'stopping' | 'stopped'

const stateTransitions: StateTransitions<State> = {
  stopped: ['starting'],
  starting: ['started'],
  started: ['stopping'],
  stopping: ['stopped'],
}

const stateMachine = () =>
  fsm<State>(stateTransitions, 'stopped', {
    name: 'Example state machine',
    onStateChange(change) {
      console.log(change)
    },
  })

test('Initial state', async () => {
  const state = stateMachine()

  // Basic `get` test
  expect(state.get()).toBe('stopped')

  // Basic `is` tests
  // NOTE: `is` can take multiple arguments, for a "one of" check
  expect(state.is('stopped')).toBeTruthy()
  expect(state.is('stopped', 'starting', 'started')).toBeTruthy()
  expect(state.is('started')).toBeFalsy()
  expect(state.is('started', 'starting', 'stopping')).toBeFalsy()
})

test('Valid state changes', () => {
  const state = stateMachine()

  for (const [oldState, newState] of [
    ['stopped', 'starting'],
    ['starting', 'started'],
    ['started', 'stopping'],
    ['stopping', 'stopped'],
  ] as [State, State][]) {
    expect(state.is(oldState)).toBeTruthy()
    expect(state.canChange(newState)).toBeTruthy()
    state.change(newState)
  }
})

test('Invalid state changes', () => {
  const state = stateMachine()
  expect(state.is('stopped')).toBeTruthy()
  expect(state.canChange('starting')).toBeTruthy()

  for (const newState of ['stopped', 'stopping', 'started'] as State[]) {
    expect(state.canChange(newState)).toBeFalsy()
    expect(() => state.change(newState)).toThrow('invalid state transition')
  }
})

test('maybeChange - valid transition', () => {
  const state = stateMachine()
  expect(state.is('stopped')).toBeTruthy()

  expect(state.canChange('starting')).toBeTruthy()
  expect(state.maybeChange('starting')).toBeTruthy()
  expect(state.is('starting')).toBeTruthy()
})

test('maybeChange - invalid transition', () => {
  const state = stateMachine()
  expect(state.is('stopped')).toBeTruthy()

  for (const newState of ['stopped', 'stopping', 'started'] as State[]) {
    expect(state.canChange(newState)).toBeFalsy()
    expect(state.maybeChange(newState)).toBeFalsy()
    expect(state.is('stopped')).toBeTruthy()
  }
})

test('Await immediate state change', async () => {
  const state = stateMachine()
  expect(await state.waitForChange('stopped')).toBeTruthy()
  // `waitForChange` can take multiple arguments, for a "one of" check
  expect(await state.waitForChange('stopped', 'started')).toBeTruthy()

  state.change('starting')
  expect(await state.waitForChange('starting')).toBeTruthy()
  expect(await state.waitForChange('starting', 'stopping')).toBeTruthy()
})

test('Await eventual state change', async () => {
  const state = stateMachine()

  setTimeout(() => state.change('starting'), 500)
  await state.waitForChange('starting')

  setTimeout(() => state.change('started'), 500)
  setTimeout(() => state.change('stopping'), 1000)
  setTimeout(() => state.change('stopped'), 1500)
  await state.waitForChange('stopped')
})
