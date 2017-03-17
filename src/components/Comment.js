
import React from 'react';
import '../styles/Comment.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import music_action from '../actions/music';

const mapStateToProps = (state) => {
    return state.music;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(music_action, dispatch);
}

class Comment extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            hotComments: [],
            total: 0,
            more: false,
            moreHot: false,
            offset: 0,
            size: 50,
            loading: false
        }
    }

    componentDidMount() {
        this.getComments();
        this.scrollEvent = () => {
            if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 10) {
                this.getMoreComments();
            }
        };
        window.addEventListener('scroll', this.scrollEvent);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollEvent);
    }

    getComments() {
        let { size } = this.state;
        let { id } = this.props.params;
        fetch(`/api/neteast/comment/${id}?size=${size}`)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let {total = 0, comments = [], hotComments = [], more, moreHot} = json;
            this.setState({total, comments, hotComments, more, moreHot, offset: size});
        });
    }

    getMoreComments() {
        let { loading, offset, size } = this.state;
        let { id } = this.props.params;
        if ( loading ) {
            return;
        }
        this.setState({loading: true});
        fetch(`/api/neteast/comment/${id}?offset=${offset}&size=${size}`)
        .then(response => response.json())
        .then(json => {
            let {comments = []} = json;
            comments = this.state.comments.concat(comments);
            offset = offset + size;
            this.setState({comments, offset, loading: false});
        });
    }

    renderItem(item, index) {
        let reply = '';
        let isReply = '';
        if (item.beReplied.length > 0) {
            reply = <div className="c-reply font14"><a href="javascript:;">@{item.beReplied[0].user.nickname}</a>：{item.beReplied[0].content}</div>;
            isReply = <span>回复<a href="javascript:;">@{item.beReplied[0].user.nickname}</a>：</span>;
        }
        return (
            <div className="comment-item" key={index}>
                <div className="c-avatar"><img src={item.user.avatarUrl+'?param=72y72'} alt=""/></div>
                <div className="c-box">
                    <div className="c-user font12">{item.user.nickname}</div>
                    <div className="c-date font10">{new Date(item.time).format('yyyy年MM月dd日')}</div>
                    <div className="c-comment font14">{isReply}{item.content}</div>
                    {reply}
                    <div className="c-agree">{item.likedCount}</div>
                </div>
            </div>
        );
    }

    render() {
        let { current } = this.props;
        let select_item = current;
        let select_dom = '';
        if (select_item) {
            select_dom = (
                <div className="comment-music">
                    <div className="comment-music-img"><img src={select_item.al.picUrl+'?param=120y120'} alt=""/></div>
                    <div className="comment-music-name middle">{select_item.name}</div>
                    <div className="comment-music-artist middle">{select_item.ar[0].name}</div>
                </div>
            )
        }
        let {total, comments, hotComments, more, moreHot} = this.state;
        let hotDom = [];
        hotComments.forEach((item, index) => {
            hotDom.push(this.renderItem(item, index));
        });
        let comDom = [];
        comments.forEach((item, index) => {
            comDom.push(this.renderItem(item, index));
        });
        let moreHotDom = '';
        if (moreHot) {
            moreHotDom = <div className="comment-hot-all">全部精彩评论</div>;
        }
        let moreDom = '';
        if (more) {
            moreDom = <div className="comment-hot-all">努力加载中...</div>;
        }
        return (
            <div className="comment-page">
                <div className="comment-header">
                    <div className="header-back" onClick={() => this.context.router.goBack()}></div>
                    <div className="header-text large">评论({total})</div>
                </div>
                {select_dom}
                <div className="comment-hot">
                    <div className="comment-top">精彩评论</div>
                    <div className="comment-list">
                        {hotDom}{moreHotDom}
                    </div>
                </div>
                <div className="comment-all">
                    <div className="comment-top">最新评论({total})</div>
                    <div className="comment-list">
                        {comDom}{moreDom}
                    </div>
                </div>
            </div>
        );
    }
}

Comment.defaultProps = {
};

Comment.contextTypes = {
    router: React.PropTypes.object
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Comment);