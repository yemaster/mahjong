/**
 * Mahjong - v1.2.0
 * /server.js
 * 
 * CopyRight 2021 (c) yemaster
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 * 
 */

const { join } = require('path')

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { cors: true })
const port = process.env.PORT || 3000
const dev_mode = 0

let onlineUsers = []
let cards = []

app.use(express.static(join(__dirname, 'statics')))

app.get('/room/:id', (req, res) => {
    res.sendFile(__dirname + '/statics/room.html')
});

const go_start_cards = (room) => {
    let pc = []
    for (let i = 0; i < 136; ++i)
        pc.push(Math.floor(i / 4))
    if (!dev_mode)
        pc.sort(() => {
            return Math.random() - 0.5
        })
    cards[room] = {
        all: pc,
        drogan: -1,
        pcard: 0,
        id: 0,
        now: 0,
        round: 0,
        ismp: 1,
        hulist: [],
        ganglist: [],
        penlist: [],
        chilist: [],
        oplist: [],
    }
    for (let i in onlineUsers[room]) {
        cards[room][onlineUsers[room][i].clientId] = []
    }
    let j = 0;
    let fbj = setInterval(function () {
        ++j;
        if (j == 4) {
            let t = 0
            for (let i in onlineUsers[room]) {
                ++t;
                cards[room][onlineUsers[room][i].clientId].push({ num: cards[room].all[++cards[room].id], type: 0 })
                if (t > 1)
                    continue
                cards[room][onlineUsers[room][i].clientId].push({ num: cards[room].all[++cards[room].id], type: 0 })
            }
            for (let i in onlineUsers[room]) {
                io.to(onlineUsers[room][i].clientId).emit('init_cards', {
                    mycards: cards[room][onlineUsers[room][i].clientId]
                })
            }
            setTimeout(function () {
                for (let i in onlineUsers[room]) {
                    cards[room][onlineUsers[room][i].clientId].sort((a, b) => {
                        if (a.type != b.type) return b.type - a.type
                        else return a.num - b.num
                    })
                }
                cards[room].drogan = [1, 2, 3, 4, 5, 6, 7, 8, 0, 10, 11, 12, 13, 14, 15, 16, 17, 9, 19, 20, 21, 22, 23, 24, 25, 26, 18, 28, 29, 30, 27, 32, 33, 31][cards[room].all[++cards[room].id] + 1]
                for (let i in onlineUsers[room]) {
                    io.to(onlineUsers[room][i].clientId).emit('init_cards', {
                        mycards: cards[room][onlineUsers[room][i].clientId]
                    })
                    io.to(onlineUsers[room][i].clientId).emit('get_dragon', {
                        dragon: cards[room].drogan
                    })
                }
            }, 500)
            clearInterval(fbj)
            return
        }
        for (let i in onlineUsers[room]) {
            for (let k = 1; k <= 4; ++k)
                cards[room][onlineUsers[room][i].clientId].push({ num: cards[room].all[++cards[room].id], type: 0 })
        }
        for (let i in onlineUsers[room]) {
            io.to(onlineUsers[room][i].clientId).emit('init_cards', {
                mycards: cards[room][onlineUsers[room][i].clientId]
            })
        }
    }, 500)
}

let tfbase = [34, 1156, 39304, 1336336]

function isAgari(pai) {
    let pattern = []
    let patternCount = 0

    for (var i = 0; i < 14; i++) {
        if (i === 0) {
            pattern[patternCount] = 1
            continue
        }
        if (pai[i] === pai[i - 1]) {
            // ??? +1
            pattern[patternCount] += 1
        } else if (pai[i] - 1 === pai[i - 1] && pai[i] < 31) {
            // ??? ????????? +1
            patternCount += 1
            pattern[patternCount] = 1
        } else {
            // ?????? ??? 0 ??????
            patternCount += 1
            pattern[patternCount] = 0
            patternCount += 1
            pattern[patternCount] = 1
        }
    }
    let mentsu = countMentsu()
    // console.log(pattern)
    function check13yao() {
        return pai.reduce((res, current, i) => {
            if (current !== pai[i + 1]) return res + current
            else return res
        }, '')
    }
    if (pattern.indexOf(2) !== -1) {
        // ??????
        if (pattern.join('') === '2222222') {
            // ?????????
            return true
        } else if (mentsu === 4) {
            return true
        } else if (check13yao() === '191119212931323334353637') {
            // ?????????
            return true
        } else {
            return false
        }
    } else {
        return false
    }
    function countMentsu() {
        let mentsuCount = 0
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === 3) {
                // ??????
                mentsuCount += 1
            } else if (pattern[i] === 1) {
                if ([pattern[i], pattern[i + 1], pattern[i + 2]].join('') === '111') {
                    // ???????????????
                    mentsuCount += 1
                    i += 2 // ????????????
                } else if (
                    [pattern[i], pattern[i + 1], pattern[i + 2], pattern[i + 3]].join(
                        ''
                    ) === '1221'
                ) {
                    // ?????????????????????
                    mentsuCount += 2
                    i += 3 // ??????2???
                } else if (
                    [
                        pattern[i],
                        pattern[i + 1],
                        pattern[i + 2],
                        pattern[i + 3],
                        pattern[i + 4],
                    ].join('') === '11211'
                ) {
                    // ?????????????????????
                    mentsuCount += 2
                    i += 5 // ??????5???
                }
            } else {
                continue
            }
        }
        return mentsuCount
    }
}

const judgehu = (x) => {
    if (typeof x != "object")
        return false
    if (x.length != 14)
        return false
    let cardsCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let i in x)
        cardsCounts[x[i]]++
    let flag1 = 0
    for (let i in cardsCounts)
        if (cardsCounts[i] % 2 == 1) {
            flag1 = 1
            break
        }
    if (!flag1)
        return true
    // Chaos
    let hasPair = 0
    for (let i in cardsCounts)
        if (cardsCounts[i] > 1) {
            hasPair = 1
            break
        }
    if (!hasPair) {
        let last = -1
        let flag = 0
        for (let i = 0; i < 9; ++i)
            if (cardsCounts[i] > 0 && (last == -1 || (i - last > 2)))
                last = i
            else if (cardsCounts[i] > 0 && last != -1 && i - last <= 2) {
                flag = 1
                break
            }
        last = -1
        for (let i = 9; i < 18; ++i)
            if (cardsCounts[i] > 0 && (last == -1 || (i - last > 2)))
                last = i
            else if (cardsCounts[i] > 0 && last != -1 && i - last <= 2) {
                flag = 1
                break
            }
        last = -1
        for (let i = 18; i < 27; ++i)
            if (cardsCounts[i] > 0 && (last == -1 || (i - last > 2)))
                last = i
            else if (cardsCounts[i] > 0 && last != -1 && i - last <= 2) {
                flag = 1
                break
            }
        if (!flag)
            return true
    }
    // Basic
    let y = Object.assign([], x)
    for (let i in y)
        y[i] = y[i] + 1
    y.sort(function (a, b) { return a - b })
    return isAgari(y)
}

const canhu = (a, b) => {
    if (typeof a != "object" || typeof b != "number")
        return false
    //console.log(a, b);
    let dragonCount = 0
    for (let i in a)
        if (a[i] == b)
            ++dragonCount
    if (dragonCount == 0) {
        if (judgehu(a))
            return true
    }
    else {
        for (let i = 0; i < tfbase[dragonCount]; ++i) {
            let lp = i
            let dragoncd = []
            let tru_cards = Object.assign([], a)
            let flag = 0
            for (let j = 0; j < dragonCount; ++j) {
                dragoncd.push(lp % 34)
                if (lp % 34 == b) {
                    flag = 1
                    break
                }
                lp = Math.floor(lp / 34)
            }
            if (flag)
                continue
            let longcards = 0
            for (let j = 0; j < tru_cards.length; ++j) {
                if (tru_cards[j] == b)
                    tru_cards[j] = dragoncd[longcards++]
            }
            if (judgehu(tru_cards))
                return true
        }
    }
    return false
}

const count = (arr, item) => {
    var count = 0;
    arr.forEach((e) => item === e ? count++ : 0);
    return count;
}

const nextRound = (room) => {
    let t = 0
    let ccid
    for (let i in onlineUsers[room]) {
        ccid = onlineUsers[room][i].clientId
        if (t == cards[room].now)
            break
        ++t
    }
    cards[room][ccid].push({ num: cards[room].all[++cards[room].id], type: 0 })
    io.to(ccid).emit('init_cards', {
        mycards: cards[room][ccid]
    })
    /*let cdlst = []
    cards[room].oplist = []
    cards[room].hulist = []
    cards[room].chilist = []
    cards[room].penlist = []
    cards[room].ganglist = []
    for (let i in cards[room][ccid])
        cdlst.push(cards[room][ccid][i])
    console.log(cdlst)
    if (canhu(cdlst, cards[room].drogan) == true) {
        cards[room].hulist.push(ccid)
        cards[room].oplist.push(ccid)
    }
    if (count(cdlst, cards[room].all[cards[room].id]) == 4) {
        cards[room].ganglist.push(ccid)
        cards[room].oplist.push(ccid)
    }
    if (cards[room].oplist.length != 0) {
        io.to(cards[room].oplist[0]).emit('available_operation', {
            op: 1,
            hu: cards[room].hulist.indexOf(cards[room].oplist[0]),
            eat: -1,
            pen: -1,
            gang: cards[room].ganglist.indexOf(cards[room].oplist[0]),
        })
    }*/
}

io.on('connection', socket => {
    //console.log('connect:' + socket.id)
    let joined_room
    socket.on('updateUser', (user_data) => {
        let cid = socket.id
        let room = user_data.room
        joined_room = room
        socket.join(joined_room)
        let data = user_data.user
        data.clientId = cid
        //console.log("UpdateUser:" + cid)
        let userId = -1
        if (typeof onlineUsers[room] != "object")
            onlineUsers[room] = []
        for (let i in onlineUsers[room]) {
            if (onlineUsers[room][i].clientId == data.clientId) {
                userId = i
                break
            }
        }
        if (userId == -1) {
            onlineUsers[room].push(data)
            io.emit('send_chat', {
                user: "asdfdsafdsfudscsadsa",
                mes: data.nickname + " joined room " + room
            })
        }
        else {
            if (onlineUsers[room][userId].nickname != data.nickname) {
                io.emit('send_chat', {
                    user: "asdfdsafdsfudscsadsa",
                    mes: onlineUsers[room][userId].nickname + " changes nickname to " + data.nickname
                })
            }
            onlineUsers[room][userId] = data
        }
        let forceNum = 0
        for (let i in onlineUsers[room])
            if (onlineUsers[room][i].status == 1)
                forceNum++;
        if (forceNum == onlineUsers[room].length && onlineUsers[room].length > 0) {
            for (let i in onlineUsers[room])
                onlineUsers[room][i].status = 2
            go_start_cards(room)
        }
        socket.emit('message', {
            class: 'success',
            mes: '????????????'
        })
        io.emit('updateOnlineUsers', { onlineUsers })
    })
    socket.on('send_chat', function (data) {
        io.emit('send_chat', data)
    })
    socket.on('put_cards', (data) => {
        //console.log(joined_room)
        let card = data.card
        let cid = socket.id
        let room = joined_room
        let t = 0
        for (let i in onlineUsers[room]) {
            if (onlineUsers[room][i].clientId == cid)
                break
            ++t
        }
        if ((cards[room].oplist.length > 0 && cards[room].oplist[0] != socket.io) || t != cards[room].now) {
            socket.emit('message', {
                class: 'error',
                mes: '??????????????????'
            })
            return
        }
        if (cards[room][cid].filter(function (item) { return item.num == card && item.type == 0 }).length <= 0) {
            socket.emit('message', {
                class: 'error',
                mes: '???????????????'
            })
            return
        }
        io.to(socket.id).emit('available_operation', {
            op: 0,
            hu: -1,
            eat: -1,
            pen: -1,
            gang: -1,
        })
        let isDelete = 0
        let newCards = []
        for (let i in cards[room][cid])
            if (cards[room][cid][i].num == card && cards[room][cid][i].type == 0 && !isDelete)
                isDelete = 1
            else
                newCards.push(cards[room][cid][i])
        newCards.sort(function (a, b) {
            if (a.type != b.type) return b.type - a.type
            else return a.num - b.num
        })
        cards[room][cid] = newCards
        io.to(cid).emit('init_cards', {
            mycards: cards[room][cid]
        })
        cards[room].now++
        if (cards[room].now == onlineUsers[room].length)
            cards[room].now = 0
        cards[room].round++
        cards[room].pcard = card
        for (let i in onlineUsers[room]) {
            io.to(onlineUsers[room][i].clientId).emit('new_put_cards', {
                new_put_cards: card,
                cid: cid
            })
        }
        let pid = 0
        cards[room].hulist = []
        cards[room].penlist = []
        cards[room].chilist = []
        cards[room].ganglist = []
        for (let i in onlineUsers[room]) {
            if (onlineUsers[room][i].clientId == socket.id)
                continue
            let cdlst = []
            for (let j in cards[room][onlineUsers[room][i].clientId])
                cdlst.push(cards[room][onlineUsers[room][i].clientId][j].num)
            let cdlst2 = []
            for (let j in cards[room][onlineUsers[room][i].clientId])
                if (cards[room][onlineUsers[room][i].clientId][j].type == 0)
                    cdlst2.push(cards[room][onlineUsers[room][i].clientId][j].num)
            if (count(cdlst2, card) >= 3)
                cards[room].ganglist.push(onlineUsers[room][i].clientId)
            if (count(cdlst2, card) >= 2)
                cards[room].penlist.push(onlineUsers[room][i].clientId)
            if (card < 27) {
                if (card % 9 >= 2 && count(cdlst2, card - 1) >= 1 && count(cdlst2, card - 2) >= 1)
                    cards[room].chilist.push(onlineUsers[room][i].clientId)
                else if (card % 9 >= 1 && card % 9 <= 7 && count(cdlst2, card - 1) >= 1 && count(cdlst2, card + 1) >= 1)
                    cards[room].chilist.push(onlineUsers[room][i].clientId)
                else if (card % 9 <= 6 && count(cdlst2, card + 1) >= 1 && count(cdlst2, card + 2) >= 1)
                    cards[room].chilist.push(onlineUsers[room][i].clientId)
            }
            if (canhu(cdlst.concat([card]), cards[room].drogan) == true)
                cards[room].hulist.push(onlineUsers[room][i].clientId)
            ++pid
        }
        cards[room].oplist = []
        for (let i in cards[room].hulist)
            if (cards[room].oplist.indexOf(cards[room].hulist[i]) == -1)
                cards[room].oplist.push(cards[room].hulist[i])
        for (let i in cards[room].ganglist)
            if (cards[room].oplist.indexOf(cards[room].ganglist[i]) == -1)
                cards[room].oplist.push(cards[room].ganglist[i])
        for (let i in cards[room].penlist)
            if (cards[room].oplist.indexOf(cards[room].penlist[i]) == -1)
                cards[room].oplist.push(cards[room].penlist[i])
        for (let i in cards[room].chilist)
            if (cards[room].oplist.indexOf(cards[room].chilist[i]) == -1)
                cards[room].oplist.push(cards[room].chilist[i])
        if (cards[room].oplist.length == 0)
            nextRound(room)
        else {
            io.to(cards[room].oplist[0]).emit('available_operation', {
                op: 1,
                hu: cards[room].hulist.indexOf(cards[room].oplist[0]),
                eat: cards[room].chilist.indexOf(cards[room].oplist[0]),
                pen: cards[room].penlist.indexOf(cards[room].oplist[0]),
                gang: cards[room].ganglist.indexOf(cards[room].oplist[0]),
            })
        }
        //console.log(cards[room].oplist, socket.id)
    })
    socket.on('do_operation', (data) => {
        let b = data.type
        let room = joined_room
        let cid = socket.id
        let pid = 0
        // 0:?????? 1:??? 2:??? 3:??? 4:???
        if (cards[room].oplist[0] != socket.id) {
            socket.emit('message', {
                class: 'error',
                mes: '??????????????????'
            })
            return
        }
        if (b == 0) {
            io.to(cards[room].oplist[0]).emit('available_operation', {
                op: 0,
                hu: -1,
                eat: -1,
                pen: -1,
                gang: -1,
            })
            cards[room].oplist = cards[room].oplist.filter((item) => { return item != socket.id })
            io.to(cards[room].oplist[0]).emit('available_operation', {
                op: 1,
                hu: cards[room].hulist.indexOf(cards[room].oplist[0]),
                eat: cards[room].chilist.indexOf(cards[room].oplist[0]),
                pen: cards[room].penlist.indexOf(cards[room].oplist[0]),
                gang: cards[room].ganglist.indexOf(cards[room].oplist[0]),
            })
            if (cards[room].oplist.length == 0)
                nextRound(room)
        }
        else {
            let cdlst = []
            let card = cards[room].pcard
            for (let j in cards[room][cid])
                if (cards[room][cid][j].type == 0)
                    cdlst.push(cards[room][cid][j].num)
            for (let j in onlineUsers[room]) {
                if (onlineUsers[room][j].clientId == cid)
                    break
                ++pid
            }
            if (b == 1) {
                if (cards[room].hulist.indexOf(cid) == -1) {
                    socket.emit('message', {
                        class: 'error',
                        mes: '???????????????'
                    })
                    return
                }
                else {
                    for (let i in onlineUsers[room])
                        io.to(onlineUsers[room][i].clientId).emit('someone_hu', {
                            hu: onlineUsers[room][pid].clientId,
                            all: cards[room]
                        })
                    //console.log(onlineUsers[room][pid].nickname + "??????")
                    return
                }
            }
            else if (b == 2) {
                if (cards[room].chilist.indexOf(cid) == -1) {
                    socket.emit('message', {
                        class: 'error',
                        mes: '???????????????'
                    })
                    return
                }
                else {
                    if (card < 27) {
                        if (card % 9 >= 2 && count(cdlst, card - 1) >= 1 && count(cdlst, card - 2) >= 1) {
                            for (let i in cards[room][cid]) {
                                if (cards[room][cid][i].num == card - 1 && cards[room][cid][i].type == 0) {
                                    cards[room][cid][i].type = cards[room].round
                                    break
                                }
                            }
                            for (let i in cards[room][cid]) {
                                if (cards[room][cid][i].num == card - 2 && cards[room][cid][i].type == 0) {
                                    cards[room][cid][i].type = cards[room].round
                                    break
                                }
                            }
                        }
                        else if (card % 9 >= 1 && card % 9 <= 7 && count(cdlst, card - 1) >= 1 && count(cdlst, card + 1) >= 1) {
                            for (let i in cards[room][cid]) {
                                if (cards[room][cid][i].num == card - 1 && cards[room][cid][i].type == 0) {
                                    cards[room][cid][i].type = cards[room].round
                                    break
                                }
                            }
                            for (let i in cards[room][cid]) {
                                if (cards[room][cid][i].num == card + 1 && cards[room][cid][i].type == 0) {
                                    cards[room][cid][i].type = cards[room].round
                                    break
                                }
                            }
                        }
                        else if (card % 9 <= 6 && count(cdlst, card + 1) >= 1 && count(cdlst, card + 2) >= 1) {
                            for (let i in cards[room][cid]) {
                                if (cards[room][cid][i].num == card + 2 && cards[room][cid][i].type == 0) {
                                    cards[room][cid][i].type = cards[room].round
                                    break
                                }
                            }
                            for (let i in cards[room][cid]) {
                                if (cards[room][cid][i].num == card + 1 && cards[room][cid][i].type == 0) {
                                    cards[room][cid][i].type = cards[room].round
                                    break
                                }
                            }
                        }
                        else {
                            //console.log(cdlst)
                            socket.emit('message', {
                                class: 'error',
                                mes: '???????????????'
                            })
                            return
                        }
                    }
                }
            }
            else if (b == 3) {
                if (cards[room].penlist.indexOf(cid) == -1) {
                    socket.emit('message', {
                        class: 'error',
                        mes: '???????????????'
                    })
                    return
                }
                else {
                    let pCount = 0
                    for (let i in cards[room][cid]) {
                        if (cards[room][cid][i].num == card && cards[room][cid][i].type == 0) {
                            cards[room][cid][i].type = cards[room].round
                            pCount++
                            if (pCount == 2)
                                break
                        }
                    }
                }
            }
            else if (b == 4) {
                if (cards[room].ganglist.indexOf(cid) == -1) {
                    socket.emit('message', {
                        class: 'error',
                        mes: '???????????????'
                    })
                    return
                }
                else {
                    let pCount = 0
                    for (let i in cards[room][cid]) {
                        if (cards[room][cid][i].num == card && cards[room][cid][i].type == 0) {
                            cards[room][cid][i].type = cards[room].round
                            pCount++
                            if (pCount == 3)
                                break
                        }
                    }
                }
            }
            cards[room][cid].push({
                num: card,
                type: cards[room].round
            })
            cards[room][cid].sort((a, b) => {
                if (a.type != b.type) return b.type - a.type
                else return a.num - b.num
            })
            io.to(cards[room].oplist[0]).emit('available_operation', {
                op: 0,
                hu: -1,
                eat: -1,
                pen: -1,
                gang: -1,
            })
            cards[room].oplist = []
            cards[room].hulist = []
            cards[room].chilist = []
            cards[room].penist = []
            cards[room].ganglist = []
            cards[room].now = pid
            io.to(cid).emit('init_cards', {
                mycards: cards[room][cid]
            })
            if (b == 4)
                nextRound(room)
            return
        }

    })
    socket.on('disconnect', (data) => {
        cid = socket.id
        let joined_room
        for (let i in onlineUsers)
            if (onlineUsers[i].filter(function (item) { return item.clientId == cid }).length > 0) {
                joined_room = i
                break
            }
        if (joined_room) {
            onlineUsers[joined_room] = onlineUsers[joined_room].filter(function (item) { return item.clientId != cid })
            for (let i in onlineUsers[joined_room])
                onlineUsers[joined_room][i].status = 0
        }
        io.emit('updateOnlineUsers', { onlineUsers })
        //console.log("Disconnected:" + cid, joined_room)
    })
})

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`);
})
