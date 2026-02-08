import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Server, Socket } from 'socket.io';

interface Player {
    socketId: string;
    userId: string;
    username: string;
    avatar: string;
    score: number;
}

interface GameState {
    id: string;
    players: Player[];
    startTime: number;
    wordCount: number;
    // We can store words here or just indices
}

@Injectable()
export class PkService {
    private server: Server;
    private queue: Player[] = [];
    private games: Map<string, GameState> = new Map();
    // Map socketId to gameId for quick options
    private playerGameMap: Map<string, string> = new Map();

    constructor(private prisma: PrismaService) { }

    setServer(server: Server) {
        this.server = server;
    }

    async joinQueue(client: Socket, user: { id: string, username: string, avatar: string }) {
        // Prevent double join
        if (this.queue.find(p => p.userId === user.id)) return;
        if (this.playerGameMap.has(client.id)) return;

        const player: Player = {
            socketId: client.id,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            score: 0
        };

        this.queue.push(player);
        client.emit('queue_joined', { position: this.queue.length });

        this.checkQueue();
    }

    async createPrivateMatch(client: Socket, user: { id: string, username: string, avatar: string }) {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const player: Player = {
            socketId: client.id,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            score: 0
        };

        const gameId = `private_${inviteCode}`;
        const game: GameState = {
            id: gameId,
            players: [player],
            startTime: Date.now(),
            wordCount: 50
        };

        this.games.set(gameId, game);
        this.playerGameMap.set(client.id, gameId);
        client.emit('private_created', { inviteCode });
        return inviteCode;
    }

    async joinPrivateMatch(client: Socket, user: { id: string, username: string, avatar: string }, inviteCode: string) {
        const gameId = `private_${inviteCode.toUpperCase()}`;
        const game = this.games.get(gameId);

        if (!game) {
            client.emit('error', { message: 'Invite code expired or invalid' });
            return;
        }

        if (game.players.length >= 2) {
            client.emit('error', { message: 'Match is already full' });
            return;
        }

        const player: Player = {
            socketId: client.id,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            score: 0
        };

        game.players.push(player);
        this.playerGameMap.set(client.id, gameId);

        // Start match
        const p1 = game.players[0];
        const p2 = game.players[1];

        const payload = { gameId, opponent: p2 };
        this.server.to(p1.socketId).emit('match_found', { gameId, opponent: p2 });
        this.server.to(p2.socketId).emit('match_found', { gameId, opponent: p1 });
    }

    leaveQueue(client: Socket) {
        this.queue = this.queue.filter(p => p.socketId !== client.id);
    }

    private async checkQueue() {
        if (this.queue.length >= 2) {
            const p1 = this.queue.shift();
            const p2 = this.queue.shift();

            if (p1 && p2) {
                await this.createGame(p1, p2);
            } else {
                // Should not happen given length check, but safe fallback
                if (p1) this.queue.unshift(p1);
                if (p2) this.queue.unshift(p2);
            }
        }
    }

    private async createGame(p1: Player, p2: Player) {
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const game: GameState = {
            id: gameId,
            players: [p1, p2],
            startTime: Date.now(),
            wordCount: 50
        };

        this.games.set(gameId, game);
        this.playerGameMap.set(p1.socketId, gameId);
        this.playerGameMap.set(p2.socketId, gameId);

        // Fetch words for the game
        // For simplicity, we trigger client to fetch or send words.
        // Better: Server sends word IDs or seeds.
        // Let's rely on client fetching same words for now OR send a seed?
        // Actually, to sync, server should provide words.
        // Let's keep it simple: Just notify match found, clients start independently but share scores.
        // Phase 4 can do strict sync.

        const payload = {
            gameId,
            opponent: p2
        };
        this.server.to(p1.socketId).emit('match_found', { ...payload, opponent: p2 });
        this.server.to(p2.socketId).emit('match_found', { ...payload, opponent: p1 });

        // Record in DB (Optional start record)
    }

    handleScore(client: Socket, score: number) {
        const gameId = this.playerGameMap.get(client.id);
        if (!gameId) return;

        const game = this.games.get(gameId);
        if (!game) return;

        const player = game.players.find(p => p.socketId === client.id);
        if (player) {
            player.score = score;
            // Broadcast update to all players in game
            game.players.forEach(p => {
                if (p.socketId !== client.id) {
                    this.server.to(p.socketId).emit('opponent_score', { score });
                }
            });

            // Check win condition?
            // Check win condition?
            if (score >= 200) {
                this.endGame(gameId, player.userId, 'score_limit');
            }
        }
    }

    async endGame(gameId: string, winnerId: string, reason: 'score_limit' | 'disconnect' | 'forfeit' = 'score_limit') {
        const game = this.games.get(gameId);
        if (!game) return;

        // Persist to DB
        try {
            await this.prisma.match.create({
                data: {
                    mode: 'pk_standard',
                    participants: {
                        create: game.players.map(p => ({
                            userId: p.userId,
                            score: p.score,
                            result: p.userId === winnerId ? 'WIN' : 'LOSS'
                        }))
                    }
                }
            });
        } catch (e) {
            console.error('Failed to save match', e);
        }

        // Notify players
        game.players.forEach(p => {
            this.server.to(p.socketId).emit('game_over', {
                winnerId: winnerId,
                isWin: p.userId === winnerId,
                reason: reason
            });
            this.playerGameMap.delete(p.socketId);
        });

        this.games.delete(gameId);
    }

    handleDisconnect(client: Socket) {
        this.leaveQueue(client);

        const gameId = this.playerGameMap.get(client.id);
        if (gameId) {
            // Auto-forfeit or just end logic
            // For now, if one leaves, the other wins?
            const game = this.games.get(gameId);
            if (game) {
                const other = game.players.find(p => p.socketId !== client.id);
                if (other) {
                    this.endGame(gameId, other.userId, 'disconnect');
                }
            }
        }
    }
}
