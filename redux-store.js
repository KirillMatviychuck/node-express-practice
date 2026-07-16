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

function createStore(reducer, initialState) {

    let state = initialState
    let subscribers = []

    return {
        getState() {
            return state
        },
        dispatch(action) {
            const result = reducer(state, action)
            state = result
            subscribers.forEach(fn => fn())
        },
        subscribe(listener) {
            subscribers.push(listener)
            return function () {
                subscribers = subscribers.filter(fn => fn !== listener)
            }
        }
    }
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
store.dispatch(increment(2))
store.dispatch(increment(2))
store.dispatch(increment(2))
store.dispatch(decrement(3))