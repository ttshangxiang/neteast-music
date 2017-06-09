
const action = {
    set_state: (new_state) => {
        return {
            type: 'set_state',
            ...new_state
        }
    },
    set_playlist: (id) => {
        return (dispatch) => {
            fetch('/api/neteast/playlist/'+id)
            .then(response => response.json())
            .then(json => {
                if (json && json.playlist && json.playlist.tracks) {
                    dispatch({
                        type: 'set_state',
                        playlist: json.playlist.tracks,
                        playlist_id: id,
                        playlist_info: json.playlist
                    });
                }
            })
        }
    },
    select_item: (index) => {
        return {
            type: 'select_item',
            current_index: index
        }
    },
    //获取歌曲播放url
    getUrl(song_id) {
        return (dispatch) => {
            fetch('/api/neteast/url/'+song_id)
            .then(response => response.json())
            .then(json => {
                if (json.data&&json.data&&json.data[0]) {
                    let audio = document.getElementById('audio');
                    audio.autoplay = 'autoplay';
                    audio.src = json.data[0].url;
                    //保存id防止每次重新加载数据
                    dispatch({
                        type: 'set_state',
                        last_id: song_id
                    })
                }
            });
        }
    },
    //获取歌词
    getLyric(song_id) {
        return (dispatch) => {
            fetch('/api/neteast/lyric/'+song_id)
            .then(response => response.json())
            .then(json => {
                //歌词，翻译，歌词作者，翻译作者，纯音乐，暂无歌词
                let { lrc, tlyric, lyricUser, transUser, nolyric, uncollected } = json;
                let obj = {}; //结果
                if (nolyric) { //纯音乐 请欣赏
                    obj =  {'纯音乐 请欣赏': {lyric: '纯音乐 请欣赏'}};
                }
                if (uncollected) {
                    obj =  {'暂无歌词': {lyric: '暂无歌词'}};
                }
                if (lrc && lrc.lyric) { //歌词
                    let reg = /\[.*\].*/g,
                        arr = lrc.lyric.match(reg);
                    arr.forEach((item) => {
                        let result = item.match(/\[(.*)\](.*)/);
                        obj[result[1]] = {
                            time: result[1],
                            lyric: result[2] || ''
                        }
                    });
                }
                if (tlyric && tlyric.lyric) { //歌词
                    let reg = /\[.*\].*/g,
                        arr = tlyric.lyric.match(reg);
                    arr.forEach((item) => {
                        let result = item.match(/\[(.*)\](.*)/);
                        obj[result[1]] && (obj[result[1]].tlyric = result[2] || '');
                    });
                }
                if (lyricUser && lyricUser.nickname) {
                    obj['歌词贡献者'] = {lyric: lyricUser.nickname };
                }
                if (transUser && transUser.nickname) {
                    obj['翻译贡献者'] = {lyric: transUser.nickname };
                }
                dispatch({
                    type: 'set_state',
                    lyric: Object.entries(obj)
                });
            })
        };
    },
    //根据id获取歌曲信息
    getSongDetail(song_id) {
        return (dispatch) => {
            fetch('/api/neteast/song/'+song_id)
            .then(response => response.json())
            .then(json => {
                dispatch({
                    type: 'set_state',
                    current: {
                        id: song_id,
                        name: json.title,
                        al: {
                            picUrl: json.img,
                            pic: json.img.match(/==\/(\d*).jpg/)[1]
                        },
                        ar: [{name: json.artist}]
                    }
                });
            })
        }
    }
}

export default action;