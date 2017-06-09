
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import music_action from '../actions/music';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import {grey400, darkBlack, lightBlack} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Avatar from 'material-ui/Avatar';
import propTypes from 'prop-types';

const mapStateToProps = (state) => {
    return state.music;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(music_action, dispatch);
}

const iconButtonElement = (
    <IconButton
        style={{padding: 0, width:'36px'}}
        touch={true}
        tooltip="more"
        tooltipPosition="bottom-left">
        <MoreVertIcon color={grey400} />
    </IconButton>
);

const rightIconMenu = (
    <IconMenu style={{top: '2px', width:'36px'}}
        iconButtonElement={iconButtonElement}>
        <MenuItem>Reply</MenuItem>
        <MenuItem>Forward</MenuItem>
        <MenuItem>Delete</MenuItem>
    </IconMenu>
);
const play_all = {
    backgroundImage: 'url('+require('../images/play_all.svg')+')',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '24px',
    height: '24px',
    margin: '8px 6px 0'
}

const renderHeader = (data) => {
    const imgStyle = {
        width: '100px',
        height: '100px',
        position: 'absolute',
        left: '36px',
        top: '48px',
        backgroundColor: '#ccc'
    };
    let img = (<div style={imgStyle}></div>);
    let info = data || {};
    let tracks = info.tracks;
    let creator = info.creator || {};
    if (tracks && tracks[0] && tracks[0].al && tracks[0].al.picUrl) {
        img = (
            <img style={imgStyle}
                src={tracks[0].al.picUrl} alt=""/>
        );
    }
    let avatar = '';
    if (creator.avatarUrl) {
        avatar = (
            <Avatar src={creator.avatarUrl} size={24} style={{verticalAlign: 'middle', marginRight:'6px'}} />
        );
    }
    const style = {
        height: '200px',
        position: 'relative',
        color: '#fff'
    }
    const style2 = {
        backgroundColor: 'rgba(42, 35, 30, 0.7)',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0
    }
    const style3 = {
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0
    }
    return (
        <div style={style}>
            {img}
            <div style={style2}></div>
            <div style={style3}>
                <div style={{fontSize: '14px', padding: '12px'}}>歌单</div>
                <div>
                    <div style={{position: 'absolute', left: '150px', top: '58px'}}>
                        <div>{info.name}</div>
                        <div style={{paddingTop:'12px'}}>
                            {avatar}
                            <span style={{verticalAlign: 'middle'}}>{creator.nickname}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
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
        playlist.slice(0, 50).forEach((item, index) => {
            dom.push(
                <ListItem key={index}
                innerDivStyle={{padding:'6px 40px 6px 44px'}}
                leftIcon={<div style={{margin:'0', width:'36px' ,textAlign:'center',top:'16px'}}>{index+1}</div>}
                rightIconButton={rightIconMenu}
                className={'item ' + (index==current_index?'active':'')}
                onClick={()=>this.selectItem(index)}
                primaryText={<div className="ellipsis" style={{fontSize:'12px' ,color: darkBlack}}>{item.name}</div>}
                secondaryText={
                    <div className="ellipsis" style={{fontSize:'9px', color: lightBlack}}>{item.ar&&item.ar[0]&&item.ar[0].name}-{item.al&&item.al.name}</div>
                }>
                </ListItem>
            )
            dom.push(<Divider key={index+'-2'} style={{marginLeft: '44px'}}/>);
        });
        return (
            <div className="playlist-page">
                <div className="playlist-box">
                    {renderHeader(playlist_info)}
                    <List style={{padding: 0}}>
                        <ListItem
                        innerDivStyle={{padding:'12px 40px 12px 44px'}}
                        leftIcon={<div style={play_all}/>}
                        primaryText={'播放全部'}
                        ></ListItem>
                        <Divider/>
                        {dom}
                    </List>
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