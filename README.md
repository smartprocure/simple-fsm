# simple-fsm

Simple finite state machine with explicit allowed state transitions,
initial state, and options around how long to wait for state transitions
when using `waitForChange` as well as explicitly naming the machine for
better debugging when using multiple machines simultaneously.

The state machine will throw if an invalid state transition is attempted.

## Example

```typescript
import { StateTransitions } from 'simple-fsm'

type State = 'starting' | 'started' | 'stopping' | 'stopped'

const stateTransitions: StateTransitions<State> = {
    stopped: ['starting'],
    starting: ['started'],
    started: ['stopping'],
    stopping: ['stopped'],
}

const state = fsm<State>(stateTransitions, 'stopped', {
    name: 'Process Records',
    onStateChange(change) {
        console.log(change)
    },
})

const start = () => {
    // Nothing to do
    if (state.is('starting', 'started')) {
        return
    }
    if (state.is('stopping')) {
        // Wait until stopping -> stopped
        await state.waitForChange('stopped')
    }
    state.change('starting')
    startTheProcess()
    state.change('started')
}

const stop = () => {
    // Nothing to do
    if (state.is('stopping', 'stopped')) {
        return
    }
    if (state.is('starting')) {
        // Wait until starting -> started
        await state.waitForChange('started')
    }
    state.change('stopping')
    await stopTheProcess()
    state.change('stopped')
}
```
