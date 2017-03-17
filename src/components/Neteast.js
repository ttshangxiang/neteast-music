
import '../styles/Neteast.css'
import React from 'react';

import 'core-js/fn/object/assign';
import 'isomorphic-fetch';
import promise from 'es6-promise';
promise.polyfill();
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import music_action from '../actions/music';

const mapStateToProps = (state) => {
    return state.music;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(music_action, dispatch);
}

class Neteast extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        let audio = document.getElementById('audio');
        let {set_state} = this.props;
        audio.addEventListener('canplay', () => {
            audio.play();
        });
        audio.addEventListener('pause', () => {
            set_state({state: 2});
        });
        audio.addEventListener('play', () => {
            set_state({state: 1});
        });
        audio.addEventListener('playing', () => {
            set_state({loading: false});
        });
        audio.addEventListener('waiting', () => {
            set_state({loading: true});
        });
    }

    render() {
        return (
            <div className={'neteast'}>
                {this.props.children}
                <audio id="audio" preload="none" ref="audio"></audio>
            </div>
        );
    }
}

Neteast.defaultProps = {
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Neteast);