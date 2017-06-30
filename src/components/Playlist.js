
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import music_action from '../actions/music';
import propTypes from 'prop-types';

const mapStateToProps = (state) => {
    return state.music;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(music_action, dispatch);
}

const renderHeader = (data) => {
    let img = (<div className="pl-avatar"></div>);
    let info = data || {};
    let tracks = info.tracks;
    let creator = info.creator || {};
    if (tracks && tracks[0] && tracks[0].al && tracks[0].al.picUrl) {
        img = (
            <img className="pl-avatar"
                src={tracks[0].al.picUrl} alt=""/>
        );
    }
    let avatar = '';
    if (creator.avatarUrl) {
        avatar = (
           <img src={creator.avatarUrl}/>
        );
    }
    return (
        <div className="playlist-header">
            {img}
            <div className="pl-mask"></div>
            <div className="pl-content">
                <div className="pl-title">歌单</div>
                <div className="pl-content-text">
                    <div>{info.name}</div>
                    <div className="pl-user">
                        {avatar}
                        <span>{creator.nickname}</span>
                    </div>
                </div>
            </div>
        </div>
    )
};

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
        let { playlist, playlist_info, current_index } = this.props;
        let dom = [];
        playlist.forEach((item, index) => {
            dom.push(
                <div
                key={index}
                className={'pl-item ' + (index==current_index?'active':'')}
                onClick={()=>this.selectItem(index)}>
                    <div className="pl-item-index">{index + 1}</div>
                    <div className="pl-item-name ellipsis">{item.name}</div>
                    <div className="pl-item-info ellipsis">{item.ar&&item.ar[0]&&item.ar[0].name}-{item.al&&item.al.name}</div>
                </div>
            )
            dom.push(<div key={index + 'line'} className="pl-line"></div>);
        });
        return (
            <div className="playlist-page">
                <div className="playlist-box">
                    {renderHeader(playlist_info)}
                        <div className="pl-item play-all">
                            <div className="pl-play-icon"></div>
                            <div>播放全部</div>
                        </div>
                        {dom}
                </div>
            </div>
        );
    }
}

Playlist.defaultProps = {
};

Playlist.contextTypes = {
    router: propTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Playlist);