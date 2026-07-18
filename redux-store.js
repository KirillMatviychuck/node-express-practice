function reducer(state, action) {
    switch (action.type) {
        case 'LOADING':
            return { ...state, status: 'loading' }
        case 'IDLE':
            return { ...state, status: 'idle' }
        case 'FAILED':
            return { ...state, status: 'failed' }
        case 'GET-MOVIES':
            return { ...state, movies: action.payload }
        default:
            return state
    }
}
const loadingStatus = () => {
    return {
        type: 'LOADING'
    }
}
const failedStatus = () => {
    return {
        type: 'FAILED'
    }
}
const idleStatus = () => {
    return {
        type: 'IDLE'
    }
}

const getMovies = (movies) => {
    return {
        type: 'GET-MOVIES',
        payload: movies
    }
}
const fetchMoviesFromAPI = () => async (dispatch, getState) => {
    try {
        dispatch(loadingStatus())
        const response = await fetch('http://localhost:3000')
        const data = await response.json()
        dispatch(getMovies(data))
        dispatch(idleStatus())
    } catch {
        dispatch(failedStatus())
    }
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
    count: 0,
    status: 'idle',
    movies: []
}
const store = createStore(reducer, initialState)

store.dispatch(fetchMoviesFromAPI())