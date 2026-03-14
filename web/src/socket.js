import { io } from "socket.io-client";
import { GameEngine } from "./engine.js";
import { GameState, Actions } from "./state.js";

class SocketManagerClass {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (this.socket && this.socket.connected) return;

        // Connect to the PK namespace using relative path
        // This works for both development (if proxy is set) and production (single server)
        // Connect to the PK namespace using dynamic URL for production
        const url = import.meta.env.VITE_SOCKET_URL || (window.location.hostname === 'localhost' && window.location.port === '5173'
            ? 'http://localhost:3000/pk'
            : '/pk');

        this.socket = io(url, {
            transports: ['websocket'],
            autoConnect: true
        });

        this.socket.on("connect", () => {
            console.log("[Socket] Connected to PK Namespace:", this.socket.id);
        });

        this.socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
            if (GameState.game.pk.isActive) {
                Actions.endPK('disconnect');
            }
        });

        this.socket.on("match_found", (data) => {
            console.log("[Socket] Match Found:", data);
            // data = { gameId, opponent: { userId, username, avatar, score, ... } }
            GameEngine.startOnlinePK(data.gameId, data.opponent);
        });

        this.socket.on("opponent_score", (data) => {
            // data = { score: number }
            GameState.game.pk.opponent.score = data.score;
            GameEngine.checkPKWinner();
        });

        this.socket.on("game_over", (data) => {
            // data = { winnerId, isWin }
            console.log("[Socket] Game Over:", data);
            if (data.isWin) {
                Actions.endPK('user', data.reason);
                GameEngine.playAudio('win');
            } else {
                Actions.endPK('bot', data.reason); // essentially opponent win
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
            // PkService doesn't have explicit leave_queue yet?
            // checking PkGateway... no handleLeaveQueue?
            // It has handleDisconnect which calls leaveQueue in service.
            // Client can just disconnect or we might want to add leave_queue later.
            // For now, disconnect or ignore.
            this.socket.disconnect();
        }
    }

    updateScore(score, gameId) {
        if (this.socket) {
            this.socket.emit("update_score", { score }); // PkGateway expects only { score }
        }
    }
}

export const SocketManager = new SocketManagerClass();
