
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

class Player extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loop: 1,
            preload: 'none', //不自动加载

            timeleft: '', //时间显示
            timeright: '',
            played: 0, //进度条
            loaded: 0, //已加载

            pic_url: '',
            pic_url_blur: '',

            lyric_index: 0,
            centerPage: 'show-cd'
        };
    }

    componentDidMount() {
        this.audio = document.getElementById('audio');
        this.checkStatus();
        let id = this.props.params.id;
        let { current } = this.props;
        if (!current) {
            this.props.getSongDetail(id);
        }
        if (id && id != this.props.last_id) {
            this.props.getUrl(id);
            this.props.getLyric(id);
        }
    }

    getImg() {
        let {current} = this.props;
        if (current && current.al) {
            let pic_url = current.al.picUrl+'?param=320y320',
                pic_url_blur = 'url("http://music.163.com/api/img/blur/'+current.al.pic+'")';
            return { pic_url, pic_url_blur };
        }
        return {pic_url: '', pic_url_blur: ''};
    }

    //秒钟变分钟
    _timeF(min) {
        return  (Math.floor(min / 60) + 100 + '').substr(1) + ':' +  (Math.floor(min % 60) + 100 + '').substr(1);
    }

    //事件
    checkStatus() {
        let audio = this.audio;
        this.endFunc = () => {
            this.change('next');
        };
        audio.addEventListener('ended', this.endFunc);
        let reg = /\d+\:\d{2}\.\d+/;
        let lyric_dom = document.getElementById('lyric-page');
        //进度条
        let { lyric } = this.props;
        let time = this._timeF(this.audio.currentTime);
        if (lyric) { //歌词初始位置
            let start_index = 0;
            for(let i = 0; i< lyric.length; i++) {
                if (lyric[i] && (!reg.test(lyric[i][0]) || time > lyric[i][0])) {
                    start_index++;
                } else {
                    break;
                }
            }
            this.setState({lyric_index: start_index});
        }
        this.timer = setInterval( () => {
            if (audio.duration && audio.currentTime) {
                time = this._timeF(this.audio.currentTime);
                let obj = {
                    timeright: this._timeF(audio.duration),
                    timeleft: time,
                    played: audio.currentTime / audio.duration * 100 + '%',
                    loaded: audio.buffered.end(0) / audio.duration * 100 + '%'
                }
                let { lyric } = this.props;
                let { lyric_index } = this.state;
                let dom = document.querySelector('#lyric-page .item.active');
                if (lyric[lyric_index] && (!reg.test(lyric[lyric_index][0]) || time > lyric[lyric_index][0])) {
                    dom && (lyric_dom.style.transform = 'translateY('+-1*(dom.offsetTop+dom.clientHeight)+'px)');
                    obj.lyric_index = lyric_index + 1;
                }
                if (lyric_index == 0) {
                    lyric_dom.style.transform = 'translateY(0px)';
                }
                this.setState(obj);

            } else {
                this.setState({
                    timeright: '00:00',
                    timeleft: '00:00',
                    played: 0,
                    loaded: 0
                });
            }
            
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.audio.removeEventListener('ended', this.endFunc);
    }

    renderProgress() {
        let {timeleft, timeright, loaded, played} = this.state;
        let {loading} = this.props;
        return (
            <div className="player-progress">
                <div className="time left">{timeleft}</div>
                <div className="time right">{timeright}</div>
                <div className="bar">
                    <div className="loaded" style={{width: loaded}}></div>
                    <div className="played" style={{width: played}}>
                        <div className="point"><div className="loading" style={{display: (loading?'block':'none')}}></div></div>
                    </div>
                </div>
            </div>
        );
    }

    backToList () {
        this.context.router.goBack();
    }

    //播放
    play() {
        if (this.props.status > 1) {
            this.audio.play();
            this.props.set_state({status:1});
        } else if (this.props.status == 1) {
            this.audio.pause();
            this.props.set_state({status:2});
        }
    }

    //切换歌曲
    change(action) {
        let { playlist, current_index, loop, set_state, getUrl, getLyric } = this.props;
        let next_index = null;
        if (action == 'next') {
            if (loop == 3) {
                next_index = Math.floor( Math.random() * playlist.length );
            } else {
                next_index = current_index + 1;
                if (next_index >= playlist.length) {
                    next_index = 0;
                }
            }
        } else if (action == 'prev') {
            next_index = current_index - 1;
            if (next_index < 0) {
                next_index = playlist.length - 1;
            }
        }
        let new_id = playlist[next_index].id;
        this.context.router.replace('/player/'+new_id);
        set_state({
            current_index: next_index,
            current: playlist[next_index],
            lyric: []
        });
        getUrl(new_id);
        getLyric(new_id);
        this.setState({lyric_index: 0});
    }

    renderLyric () {
        let { lyric } = this.props;
        if (!lyric) return;
        let { lyric_index } = this.state;
        let dom = [];
        lyric.forEach((item, index) => {
            let [key, value] = item;
            let cls = 'item';
            if (index == lyric_index -1) {
                cls += ' active';
            }
            dom.push(
                <div key={key} className={cls}>
                    <div className="middle">{value.lyric}</div>
                    <div>{value.tlyric || ''}</div>
                </div>
            );
        });
        return dom;
    }

    //切换歌词
    changeCenter () {
        if (this.state.centerPage == 'show-cd') {
            this.setState({centerPage: 'show-lyric'});
        } else {
            this.setState({centerPage: 'show-cd'});
        }
    }

    //跳转到评论
    showComment() {
        let { current } = this.props;
        if (!current) return;
        this.context.router.push('/comment/'+current.id);
    }

    render() {
        let { current } = this.props;
        let { pic_url, pic_url_blur } = this.getImg();
        let select_item = {al:{},ar:[{}]};
        if (current !== null) {
            select_item = current;
        }
        let progress_dom = this.renderProgress();
        let lrc_dom = this.renderLyric();
        let centerCls = this.props.status==1?' play ':'';
            centerCls += this.state.centerPage;
        return (
            <div className="player-page">
                <div className="player-bg" style={{backgroundImage: pic_url_blur}}>
                    <div className="player-bg2"></div>
                </div>
                <div className="player-header">
                    <div className="player-back" onClick={() => this.backToList()}></div>
                    <div className="player-title">
                        <div className="title">{select_item.name}</div>
                        <div className="artist">{select_item.ar[0].name}</div>
                    </div>
                </div>
                <div className={'player-center ' + centerCls} onClick={() => this.changeCenter()}>
                    <div className="cd-page">
                        <div className="play-line"></div>
                        <div className="player-bang"></div>
                        <div className="player-cd">
                            <img className="cd-img" src={pic_url} alt=""/>
                            <div className="cd-circle"></div>
                        </div>
                    </div>
                    <div className="lyric-page" id="lyric-page">
                        {lrc_dom}
                    </div>
                </div>
                <div className="player-footer">
                    <div className="player-option">
                        <div className="wrap">
                            <div className="item love"></div>
                            <div className="item download"></div>
                            <div className="item comment small" onClick={() => this.showComment()}>999+</div>
                            <div className="item more"></div>
                        </div>
                    </div>
                    {progress_dom}
                    <div className="player-controller">
                        <div className="random"></div>
                        <div className="list"></div>
                        <div className="wrap">
                            <div className="prev" onClick={() => this.change('prev')}></div>
                            <div className={'play ' + (this.props.status==1?'':'pause')} onClick={() => this.play()}></div>
                            <div className="next" onClick={() => this.change('next')}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Player.defaultProps = {
};

Player.contextTypes = {
    router: propTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);