import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import reducers from './reducers/reducers';

import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import './styles/Neteast.css'
import './styles/Font.css'
import Neteast from './components/Neteast';
import Playlist from './components/Playlist';
import Player from './components/Player';
import Comment from './components/Comment';
import './util/polyfill';

// Store
const store = createStore(reducers, applyMiddleware(thunkMiddleware));

ReactDOM.render(
    <Provider store = { store } >
        <Router history = { hashHistory }>
            <Route path="/" component={ Neteast }>
                <IndexRoute component={ Playlist }></IndexRoute>
                <Route path="/playlist(/:id)" component={ Playlist }></Route>
                <Route path="/player(/:id)" component={ Player }></Route>
                <Route path="/comment/:id" component={ Comment }></Route>
            </Route>
        </Router>
    </Provider>
, document.getElementById('app'));