function reducer(state, action) {
    switch (action.type) {
        case 'INCREMENT':
            return { ...state, count: state.count + action.payload.num }
        case 'DECREMENT':
            return { ...state, count: state.count - action.payload.num }
        default:
            return state
    }
}

function increment(num) {
    return {
        type: 'INCREMENT',
        payload: {
            num
        }
    }
}
function decrement(num) {
    return {
        type: 'DECREMENT',
        payload: {
            num
        }
    }
}

const incrementAsync = num => (dispatch, getState) => {
    setTimeout(() => {
        dispatch(increment(num))
    }, 1000)
}

function createStore(reducer, initialState) {

    let state = initialState
    let subscribers = []

    const store = {
        getState() {
            return state
        },
        dispatch(action) {
            if (typeof action === 'function') {
                action(store.dispatch, store.getState)
            } else {
                const result = reducer(state, action)
                state = result
                subscribers.forEach(fn => fn())
            }
        },
        subscribe(listener) {
            subscribers.push(listener)
            return function () {
                subscribers = subscribers.filter(fn => fn !== listener)
            }
        }
    }

    return store
}
const initialState = {
    count: 0
}
const store = createStore(reducer, initialState)

const subInc = () => {
    const state = store.getState()
    console.log(`State changed... ${state.count}`)
}
store.subscribe(subInc)
store.dispatch(incrementAsync(5))
