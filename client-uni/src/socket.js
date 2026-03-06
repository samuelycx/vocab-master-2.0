// 使用云开发实时数据库替代WebSocket
// 安全优化：移除外部WebSocket服务器依赖

import { GameEngine } from "./engine.js";
import { GameState, Actions } from "./state.js";

class SocketManagerClass {
    constructor() {
        this.watcher = null;
        this.roomId = null;
        this.db = null;
    }

    // 初始化数据库
    initDB() {
        if (!this.db) {
            this.db = wx.cloud.database();
        }
    }

    _toDate(raw) {
        if (!raw) return null;
        if (typeof raw.toDate === 'function') return raw.toDate();
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return null;
        return date;
    }

    async cleanupStaleRooms() {
        this.initDB();
        const now = Date.now();
        const waitingExpireAt = new Date(now - 2 * 60 * 1000);
        const endedExpireAt = new Date(now - 10 * 60 * 1000);

        try {
            const staleWaiting = await this.db.collection('pk_rooms')
                .where({
                    status: 'waiting',
                    createdAt: this.db.command.lt(waitingExpireAt)
                })
                .limit(30)
                .get();

            const staleEnded = await this.db.collection('pk_rooms')
                .where({
                    status: 'ended',
                    endedAt: this.db.command.lt(endedExpireAt)
                })
                .limit(50)
                .get();

            const toRemove = [
                ...(staleWaiting.data || []).map(r => r._id),
                ...(staleEnded.data || []).map(r => r._id)
            ];
            if (toRemove.length === 0) return;

            await Promise.all(
                toRemove.map(id =>
                    this.db.collection('pk_rooms').doc(id).remove().catch(() => null)
                )
            );
        } catch (e) {
            console.warn('清理过期房间失败', e);
        }
    }

    // 加入匹配队列
    async joinQueue(id, username, avatar) {
        this.initDB();
        
        try {
            await this.cleanupStaleRooms();

            // 查找等待中的房间
            const waitingRooms = await this.db.collection('pk_rooms')
                .where({
                    status: 'waiting',
                    playerCount: 1
                })
                .orderBy('createdAt', 'asc')
                .limit(1)
                .get();

            if (waitingRooms.data.length > 0) {
                // 加入现有房间
                const room = waitingRooms.data[0];
                await this.joinRoom(room._id, id, username, avatar);
            } else {
                // 创建新房间
                await this.createRoom(id, username, avatar);
            }
        } catch (e) {
            console.error('加入匹配队列失败', e);
            wx.showToast({
                title: '匹配失败，请重试',
                icon: 'none'
            });
        }
    }

    // 创建新房间
    async createRoom(userId, username, avatar) {
        try {
            const result = await this.db.collection('pk_rooms').add({
                data: {
                    status: 'waiting',
                    playerCount: 1,
                    players: [{
                        userId,
                        username,
                        avatar,
                        score: 0
                    }],
                    createdAt: this.db.serverDate()
                }
            });
            
            this.roomId = result._id;
            
            // 监听房间变化
            this.watchRoom(result._id);
            
            // 提示用户正在等待匹配
            wx.showToast({
                title: '正在匹配对手...',
                icon: 'loading',
                duration: 10000
            });
            
            // 30秒后如果还没匹配到，自动取消
            setTimeout(() => {
                if (this.roomId && this.db) {
                    this.db.collection('pk_rooms').doc(this.roomId).get().then(res => {
                        const createdAt = this._toDate(res?.data?.createdAt);
                        const expired = !createdAt || (Date.now() - createdAt.getTime()) >= 30000;
                        if (res?.data?.status === 'waiting' && expired) {
                            this.leaveQueue();
                            wx.showToast({
                                title: '匹配超时，请重试',
                                icon: 'none'
                            });
                        }
                    });
                }
            }, 30000);
            
        } catch (e) {
            console.error('创建房间失败', e);
        }
    }

    // 加入现有房间
    async joinRoom(roomId, userId, username, avatar) {
        try {
            const joinRes = await this.db.collection('pk_rooms').where({
                _id: roomId,
                status: 'waiting',
                playerCount: 1
            }).update({
                data: {
                    playerCount: 2,
                    status: 'playing',
                    players: this.db.command.push({
                        userId,
                        username,
                        avatar,
                        score: 0
                    })
                }
            });

            if (!joinRes.stats || joinRes.stats.updated === 0) {
                // 房间已被抢占或已失效，重新入队匹配
                await this.joinQueue(userId, username, avatar);
                return;
            }

            const room = await this.db.collection('pk_rooms').doc(roomId).get();
            if (!room.data || !Array.isArray(room.data.players) || room.data.players.length < 2) {
                throw new Error('房间状态异常');
            }

            this.roomId = roomId;
            
            // 监听房间变化
            this.watchRoom(roomId);
            
            // 通知游戏开始
            const opponent = room.data.players.find(p => p.userId !== userId) || room.data.players[0];
            GameEngine.startOnlinePK(roomId, {
                username: opponent.username,
                avatar: opponent.avatar
            });
            
        } catch (e) {
            console.error('加入房间失败', e);
            await this.joinQueue(userId, username, avatar);
        }
    }

    // 监听房间变化
    watchRoom(roomId) {
        this.initDB();
        
        // 关闭之前的监听
        if (this.watcher) {
            this.watcher.close();
        }
        
        // 监听房间变化
        this.watcher = this.db.collection('pk_rooms')
            .doc(roomId)
            .watch({
                onChange: (snapshot) => {
                    const room = snapshot.docs[0];
                    if (!room) {
                        if (this.watcher) {
                            this.watcher.close();
                            this.watcher = null;
                        }
                        if (!GameState.game.pk.winner && GameState.game.pk.isSearching) {
                            GameState.game.pk.isSearching = false;
                            wx.showToast({
                                title: '房间已失效，请重试',
                                icon: 'none'
                            });
                        }
                        return;
                    }
                    if (room && room.players) {
                        const myId = GameState.user.id || GameState.user._id || GameState.user.openid;
                        // 更新对手分数
                        const opponent = room.players.find(p => p.userId !== myId);
                        if (opponent) {
                            if (!GameState.game.pk.opponent) {
                                GameState.game.pk.opponent = {
                                    name: opponent.username || 'Opponent',
                                    avatar: opponent.avatar || '',
                                    score: 0
                                };
                            }
                            GameState.game.pk.opponent.score = opponent.score;
                            GameEngine.checkPKWinner();
                        }
                        
                        // 检查游戏是否结束
                        if (room.status === 'ended') {
                            // Avoid repeated settlement on duplicated watch events.
                            if (GameState.game.pk.winner) return;

                            const myPlayer = room.players.find(p => p.userId === myId);
                            const otherPlayer = room.players.find(p => p.userId !== myId);
                            
                            if (myPlayer && otherPlayer) {
                                const isWin = myPlayer.score > otherPlayer.score;
                                if (isWin) {
                                    Actions.endPK('user', 'score_limit');
                                    GameEngine.playAudio('win');
                                } else {
                                    Actions.endPK('bot', 'score_limit');
                                    GameEngine.playAudio('loss');
                                }
                            }
                        }
                    }
                },
                onError: (err) => {
                    console.error('监听房间失败', err);
                }
            });
    }

    // 更新分数
    async updateScore(score) {
        if (!this.roomId || !this.db) return;
        
        try {
            const myId = GameState.user.id || GameState.user._id || GameState.user.openid;
            if (!myId) return;

            // 获取当前房间信息
            const room = await this.db.collection('pk_rooms').doc(this.roomId).get();
            if (!room.data) return;
            
            // 更新自己的分数
            const players = room.data.players.map(p => {
                if (p.userId === myId) {
                    return { ...p, score };
                }
                return p;
            });
            
            await this.db.collection('pk_rooms').doc(this.roomId).update({
                data: {
                    players
                }
            });
            
            // 检查是否达到胜利条件（200分）
            if (score >= 200) {
                await this.endGame(this.roomId, myId, 'score_limit');
            }
            
        } catch (e) {
            console.error('更新分数失败', e);
        }
    }

    // 结束游戏
    async endGame(roomId, winnerId, reason) {
        try {
            await this.db.collection('pk_rooms').doc(roomId).update({
                data: {
                    status: 'ended',
                    endedAt: this.db.serverDate(),
                    winnerId,
                    endReason: reason
                }
            });
        } catch (e) {
            console.error('结束游戏失败', e);
        }
    }

    // 离开队列
    async leaveQueue() {
        // 关闭监听
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        
        // 安全退出：等待房间可删除；对战中仅标记结束，避免删掉对手房间
        if (this.roomId && this.db) {
            try {
                const res = await this.db.collection('pk_rooms').doc(this.roomId).get();
                const room = res.data;
                if (room) {
                    if (room.status === 'waiting') {
                        await this.db.collection('pk_rooms').doc(this.roomId).remove();
                    } else if (room.status === 'playing') {
                        await this.db.collection('pk_rooms').doc(this.roomId).update({
                            data: {
                                status: 'ended',
                                endReason: 'quit',
                                endedAt: this.db.serverDate()
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('删除房间失败', e);
            }
            this.roomId = null;
        }
        
        // 隐藏提示
        wx.hideToast();
    }
}

export const SocketManager = new SocketManagerClass();
