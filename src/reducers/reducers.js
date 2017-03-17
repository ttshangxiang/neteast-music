import { combineReducers } from 'redux';
import store_music from '../stores/music';

const music = (state = store_music, action) => {
    let {type, ...payload} = action;
    switch (type) {
        case 'set_state':
            return Object.assign({},state, payload);
        case 'select_item':
            return Object.assign({},state, payload, {
                current: state.playlist[payload.current_index]
            });
        default:
            return state;
    }
}

const Reducer = combineReducers({
    music
})

export default Reducer;