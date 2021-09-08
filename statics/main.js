/**
 * Mahjong - v1.2.0
 * /statics/main.js
 * 
 * CopyRight 2021 (c) yemaster
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 * 
 */

// Translations
const messages = {
    en: {
        nav: {
            home: 'Homepage',
            settings: 'Settings',
            room: 'Rooms',
            help: 'Help',
            language: 'Language'
        },
        user: {
            nickname: "Nickname",
            status: 'Status',
            free: 'Free',
            waiting: 'Waiting',
            ingame: 'Gaming',
        },
        game: {
            dragon: 'Dragon',
            unknown: 'Unknown',
            yourCards: 'Your Cards',
            yourRound: 'Your Round',
            discardedCards: 'Discarded Cards',
            me: 'Me',
            options: 'Options',
            cancel: 'Cancel',
            eat: 'Eat',
            pen: 'Bump',
            gang: 'Lever',
            hu: 'Agari',
        },
        mes: {
            onlineUsers: 'Online Users',
            gettingConnected: 'Contacting the server...',
            randomOne: 'Random',
            update: 'Update',
            link: 'Link',
            copy: 'Copy',
            forceStart: 'Force Start',
        }
    },
    cn: {
        nav: {
            home: '首页',
            settings: '设置',
            room: '房间',
            help: '帮助',
            language: '语言'
        },
        user: {
            nickname: "昵称",
            status: '状态',
            free: '空闲',
            waiting: '等待开始',
            ingame: '游戏中',
        },
        game: {
            dragon: '龙',
            unknown: '不知道',
            yourCards: '你的牌',
            yourRound: '你的回合',
            discardedCards: '出牌情况',
            me: '我',
            options: '操作',
            cancel: '取消',
            eat: '吃',
            pen: '碰',
            gang: '杠',
            hu: '胡',
        },
        mes: {
            onlineUsers: '在线用户',
            gettingConnected: '正在与服务器取得联系...',
            randomOne: '随机一个',
            update: '更新',
            link: '链接',
            copy: '复制',
            forceStart: '强制开始',
        }
    },
    jp: {
        nav: {
            home: 'トップページ',
            settings: '設置',
            room: '部屋',
            help: '助けて',
            language: '言語'
        },
        user: {
            nickname: "ニックネーム",
            status: '状态',
            free: '暇',
            waiting: '始まりを待つ',
            ingame: 'ゲームの中',
        },
        game: {
            dragon: '竜',
            unknown: '知らない',
            yourCards: 'あなたのカード',
            yourRound: 'あなたのラウンド',
            discardedCards: '出されたカード',
            me: '私が',
            options: '操作',
            cancel: 'キャンセル',
            eat: '食べ',
            pen: '触れ',
            gang: 'ぶつかる',
            hu: '胡',
        },
        mes: {
            onlineUsers: 'オンラインユーザー',
            gettingConnected: 'サーバーと連絡を取っている...',
            randomOne: 'ランダムに',
            update: '更新',
            link: 'リンク',
            copy: 'コピー',
            forceStart: '強制が始まる',
        }
    }
}

const i18n = new VueI18n({
    locale: 'cn',
    fallbackLocale: 'cn',
    messages,
})

let mahjong = new Vue({
    el: '#app',
    data: {
        room: location.pathname.match(/\/room\/(.*)/)[1],
        appName: '',
        user: {
            nickname: '匿名',
            status: 0
        },
        sked: {
            id: 'Unknown'
        },
        game: {
            cards: [],
            dragon: -1,
            pt: [[], [], [], []],
            me: -1,
        },
        serverLink: '',
        onlineUsers: [],
        chats: [],
        chatMessage: '',
        isloading: 1,
        canOp: 0,
        canEat: 0,
        canPen: 0,
        canGang: 0,
        canHu: 0,
        huPeople: '',
        allShow: {},
        langs: [{
            val: 'en',
            show: 'English',
            flag: 'gb uk'
        },
        {
            val: 'cn',
            show: '简体中文',
            flag: 'cn'
        },
        {
            val: 'jp',
            show: '日本語',
            flag: 'jp'
        },],
        cardsname: ["1万", "2万", "3万", "4万", "5万", "6万", "7万", "8万", "9万", "1筒", "2筒", "3筒", "4筒", "5筒", "6筒", "7筒", "8筒", "9筒", "1条", "2条", "3条", "4条", "5条", "6条", "7条", "8条", "9条", "东", "南", "西", "北", "中", "发", "白"]
    },
    computed: {
        forcedUsers() {
            let ret = 0
            for (let i in this.onlineUsers) {
                if (this.onlineUsers[i].status == 1)
                    ret++;
            }
            return ret;
        }
    },
    mounted() {
        let _t = this
        $('.menu .item')
            .tab()
            ;
        $('.dropdown').dropdown()
        $('.ui.checkbox').checkbox()
        _t.sked = io()
        if (localStorage.mnick != undefined)
            _t.user.nickname = localStorage.mnick
        _t.sked.on('updateOnlineUsers', function (data) {
            _t.onlineUsers = data.onlineUsers[_t.room]
            let cnt = 0
            for (let i in _t.onlineUsers) {
                if (_t.onlineUsers[i].clientId == _t.sked.id) {
                    _t.user.status = _t.onlineUsers[i].status
                    _t.game.me = cnt
                }
                ++cnt
            }
        })
        _t.sked.on('updateRooms', function (data) {
            _t.roomList = data.RoomList
        })
        _t.sked.on('message', function (data) {
            $('body')
                .toast({
                    class: data.class,
                    message: data.mes
                })
                ;
        })
        _t.sked.on('available_operation', function (data) {
            _t.canOp = data.op
            _t.canHu = data.hu == -1 ? false : true
            _t.canEat = data.eat == -1 ? false : true
            _t.canPen = data.pen == -1 ? false : true
            _t.canGang = data.gang == -1 ? false : true
        })
        _t.sked.on('send_chat', function (data) {
            _t.chats.push(data)
            $("#chat_main").animate({ scrollTop: 2333333 })
        })
        _t.sked.on('init_cards', function (data) {
            _t.game.cards = data.mycards
        })
        _t.sked.on('get_dragon', function (data) {
            _t.game.dragon = data.dragon
        })
        _t.sked.on('connect', function (data) {
            $('a[data-tab=basic]').click()
            _t.isloading = 0
            _t.updateMe()
        })
        _t.sked.on('new_put_cards', function (data) {
            let olu = _t.onlineUsers
            let cp = -1
            let cnt = 0
            for (let i in olu) {
                if (olu[i].clientId == data.cid)
                    cp = cnt
                ++cnt
            }
            if (cp == -1) {
                $('body')
                    .toast({
                        class: 'error',
                        message: '致命的错误：cid not found'
                    })
                return
            }
            if (typeof _t.game.pt[cp] != 'object')
                _t.game.pt[cp] = []
            for (let i in _t.game.pt)
                for (let j in _t.game.pt[i])
                    _t.game.pt[i][j] %= 100
            _t.game.pt[cp].push(data.new_put_cards + 100)
        })
        _t.sked.on('someone_hu', (data) => {
            //alert(data.hu + '糊了！')
            //console.log(data.all)
            //_t.user.status = 0
            //_t.updateMe()
            _t.huPeople = data.hu
            _t.allShow = data.all
        })
        _t.sked.on('disconnect', (data) => {
            _t.isloading = 1
        })
        $('.peopleNum').slider({
            min: 2,
            max: 4,
            smooth: true
        })
    },
    methods: {
        genName() {
            let Ch1 = ["殇", "伤", "裳", "霓", "离", "璃", "婉", "晚", "绾", "挽", "辞", "歌", "泪", "霜", "柒", "流", "乡", "梦", "忆", "衣", "依", "意", "亦", "艺", "伊", "曦", "溪", "兮", "惜", "浅", "芊", "苏", "落", "洛", "执", "樱", "雪", "音", "若", "蝶", "星", "月", "光", "诗", "思", "卿", "君"]
            let Ch2 = ["ヘ", "ン", "ヮ", "ャ", "マ", "ァ", "キ", "の"]
            let p = 2
            let Name = ""
            p += Math.floor(Math.random() * 3)
            for (let i = 0; i < p; ++i)
                Name += Ch1[Math.floor(Math.random() * Ch1.length)]
            Name += Ch2[Math.floor(Math.random() * Ch2.length)]
            for (let i = 0; i < 2; ++i)
                Name += Ch1[Math.floor(Math.random() * Ch1.length)]
            return Name
        },
        randomName() {
            this.user.nickname = this.genName()
        },
        updateMe() {
            localStorage.mnick = this.user.nickname
            this.sked.emit('updateUser', {
                user: this.user,
                room: this.room
            })
        },
        sendMessage(e) {
            e.preventDefault();
            this.sked.emit('send_chat', {
                user: this.user.nickname,
                mes: this.chatMessage
            })
            this.chatMessage = ''
        },
        changeStatus() {
            this.game = {
                cards: [],
                dragon: -1,
                pt: [[], [], [], []],
                me: -1
            }
            this.canEat = 0
            this.canGang = 0
            this.canOp = 0
            this.canGang = 0
            this.canPen = 0
            this.user.status = 1 - this.user.status
            this.sked.emit('updateUser', {
                user: this.user,
                room: this.room
            })
        },
        put_card(e) {
            let _t = this
            _t.sked.emit('put_cards', {
                card: e
            })
        },
        doOp(e) {
            const _t = this
            _t.sked.emit('do_operation', {
                type: e
            })
        },
        quitGame() {
            this.user.status = 0
            this.sked.emit('updateUser', {
                user: this.user,
                room: this.room
            })
        }
    },
    i18n
})