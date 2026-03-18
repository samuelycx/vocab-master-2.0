import io from 'weapp.socket.io';
import { GameEngine } from "./engine.js";
import { GameState, Actions } from "./state.js";

class SocketManagerClass {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket && this.socket.connected) return;

        // WeChat Mini Program requires absolute WS URL
        // WebSocket URL configuration
        const SOCKET_URL = 'ws://101.34.65.203:3000/pk';
        const url = SOCKET_URL;

        this.socket = io(url, {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on("connect", () => {
            console.log("[Socket] Connected to PK:", this.socket.id);
        });

        this.socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
            if (GameState.game.pk.isActive) {
                Actions.endPK('disconnect');
            }
        });

        this.socket.on("match_found", (data) => {
            GameEngine.startOnlinePK(data.gameId, data.opponent);
        });

        this.socket.on("opponent_score", (data) => {
            GameState.game.pk.opponent.score = data.score;
            GameEngine.checkPKWinner();
        });

        this.socket.on("game_over", (data) => {
            if (data.isWin) {
                Actions.endPK('user', data.reason);
                GameEngine.playAudio('win');
            } else {
                Actions.endPK('bot', data.reason);
                GameEngine.playAudio('loss');
            }
        });
    }

    joinQueue(id, username, avatar) {
        if (!this.socket) this.connect();
        this.socket.emit("join_queue", { id, username, avatar });
    }

    leaveQueue() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    updateScore(score) {
        if (this.socket) {
            this.socket.emit("update_score", { score });
        }
    }
}

export const SocketManager = new SocketManagerClass();
