
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import music_action from '../actions/music';

const mapStateToProps = (state) => {
    return state.music;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(music_action, dispatch);
}

class Playlist extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        this.first = false;
        let { id = '109717983' } = this.props.params;
        let { playlist_id } = this.props;
        if (id != playlist_id) {
            this.props.set_playlist(id);
        }
    }

    selectItem (index) {
        if (!this.first) { //uc bug，必须手动触发一次play
            document.getElementById('audio').play();
            this.first = true;
        }
        this.props.select_item(index);
        let { playlist } = this.props;
        this.context.router.push('/player/'+playlist[index].id);
    }

    render() {
        let { playlist, current_index } = this.props;
        let dom = [];
        playlist.forEach((item, index) => {
            dom.push(<li key={index} className={'item ' + (index==current_index?'active':'')} onClick={()=>this.selectItem(index)}>{index}、{item.name} - {item.ar&&item.ar[0]&&item.ar[0].name}</li>)
        });
        return (
            <div className="playlist-page">
                <div className="playlist-box">
                    <ul className="playlist">{dom}</ul>
                </div>
            </div>
        );
    }
}

Playlist.defaultProps = {
};

Playlist.contextTypes = {
    router: React.PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Playlist);