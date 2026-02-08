import { SocketManager } from './socket.js';

import { reactive } from 'vue';
import { GameState, Actions } from './state.js';
import { API } from './api.js';

export const GameEngine = {
    session: reactive({
        queue: [],
        currentIndex: 0,
        currentWord: null,
        currentExample: null,
        options: [],
        correctOption: null,
        selectedOption: null,
        isAnswered: false,
        isCorrect: false,
        timeLeft: 15,
        sessionXP: 0,
        sessionCoins: 0,
        sessionCorrect: 0,
        mode: 'learn' // learn, review, mistake, pk
    }),

    wordMap: {},
    distractorPool: [],
    timerHandle: null,
    botInterval: null,

    async startSession(count = 10) {
        const category = GameState.user.targetCategory || 'GENERAL';
        const rawWords = await API.getSessionWords(count, category);
        if (!rawWords || rawWords.length === 0) {
            alert('数据库中暂无单词，请确保已正确导入词书！');
            return;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            meanings: (typeof w.meanings === 'string') ? JSON.parse(w.meanings) : w.meanings,
            examples: (typeof w.examples === 'string') ? JSON.parse(w.examples) : w.examples
        }));

        this._setupSession(formattedWords, formattedWords, 'learn');
    },

    async startReview(userId) {
        const rawWords = await API.getReviews(userId);
        if (!rawWords || rawWords.length === 0) {
            alert('No words to review yet! Keep learning.');
            return;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            meanings: (typeof w.meanings === 'string') ? JSON.parse(w.meanings) : w.meanings,
            examples: (typeof w.examples === 'string') ? JSON.parse(w.examples) : w.examples
        }));

        this._setupSession(formattedWords, formattedWords, 'review');
    },

    async startMistake(userId) {
        const rawWords = await API.getMistakes(userId);
        if (!rawWords || rawWords.length === 0) {
            alert('Great! No mistakes to review.');
            return;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            meanings: (typeof w.meanings === 'string') ? JSON.parse(w.meanings) : w.meanings,
            examples: (typeof w.examples === 'string') ? JSON.parse(w.examples) : w.examples
        }));

        this._setupSession(formattedWords, formattedWords, 'mistake');
    },

    async startPKSession() {
        // ... (keep bot logic or replace? Plan said keep bot as fallback or default for "Practice")
        // Let's keep startPKSession for "Practice" mode (Bot)
        const category = GameState.user.targetCategory || 'GENERAL';
        const rawWords = await API.getSessionWords(50, category);
        if (!rawWords || rawWords.length === 0) return;

        // Format words
        const formattedWords = rawWords.map(w => ({
            ...w,
            meanings: (typeof w.meanings === 'string') ? JSON.parse(w.meanings) : w.meanings,
            examples: (typeof w.examples === 'string') ? JSON.parse(w.examples) : w.examples
        }));

        this._setupSession(formattedWords, formattedWords, 'pk');
        Actions.initPK('Vocab Bot 3000');
        if (this.botInterval) clearInterval(this.botInterval);
        this.botInterval = setInterval(() => {
            this._botLoop();
        }, 3000);
        Actions.setView('pk');
    },

    startMatchmaking() {
        if (this.botInterval) clearInterval(this.botInterval);
        // Set state to searching
        GameState.game.pk.isSearching = true;
        SocketManager.joinQueue(GameState.user.id, GameState.user.username, GameState.user.avatar);
        Actions.setView('pk'); // or pk_lobby? PKArena handles lobby state.
        // If we set view to 'pk', PKArena mounts.
        // PKArena defaults to lobby.
        // But if we are already searching, we should tell PKArena.
        // PKArena reads isSearching from state.
        // Let's assume we show a searching status in the PK view or a specific lobby view.
        // For simplicity, let's just set a flag and maybe show a modal.
    },

    async startOnlinePK(gameId, opponent) {
        if (this.botInterval) clearInterval(this.botInterval);
        GameState.game.pk.isSearching = false;

        // Fetch words? Or backend provides?
        // In this simple version, let's fetch locally to start quickly, 
        // BUT ideally backend sends words.
        // For now, let's fetch locally but use a seed if possible? 
        // Or just fetch same category.
        const category = GameState.user.targetCategory || 'GENERAL';
        const rawWords = await API.getSessionWords(50, category);
        if (!rawWords || rawWords.length === 0) return;

        const formattedWords = rawWords.map(w => ({
            ...w,
            meanings: (typeof w.meanings === 'string') ? JSON.parse(w.meanings) : w.meanings,
            examples: (typeof w.examples === 'string') ? JSON.parse(w.examples) : w.examples
        }));

        this._setupSession(formattedWords, formattedWords, 'pk');

        this.session.gameId = gameId; // Store game ID
        Actions.initPK(opponent.username || 'Opponent', opponent.avatar);
        Actions.setView('pk');
    },

    _setupSession(queueWords, poolWords, mode) {
        Actions.resetCombo();

        this.session.queue = queueWords.map(w => w.text);
        this.wordMap = queueWords.reduce((acc, w) => {
            acc[w.text] = w;
            return acc;
        }, {});

        // Use poolWords for distractors.
        this.distractorPool = poolWords
            .map(w => w.meanings[0])
            .filter(m => m && m.trim().length > 0);

        this.session.mode = mode;
        this._resetSessionStats();
        this.session.currentIndex = 0;
        this.loadNextQuestion();

        if (mode !== 'pk') {
            Actions.setView('arena');
        }
    },

    loadNextQuestion() {
        if (this.session.currentIndex >= this.session.queue.length) {
            this.finishSession();
            return;
        }

        const wordKey = this.session.queue[this.session.currentIndex];
        const wordData = this.wordMap[wordKey];

        this.session.currentWord = {
            word: wordData.text,
            ...wordData
        }
        // Generate Options
        const correctMeaning = wordData.meanings[0];
        const distractors = this.generateDistractors(correctMeaning);

        this.session.correctOption = correctMeaning;
        this.session.selectedOption = null; // Reset selection
        this.session.options = this.shuffleArray([correctMeaning, ...distractors]);
        this.session.isAnswered = false;
        this.session.isCorrect = false;
        this.startTimer();
    },

    startTimer() {
        if (this.timerHandle) clearInterval(this.timerHandle);
        this.session.timeLeft = 15;
        this.timerHandle = setInterval(() => {
            if (this.session.isAnswered) {
                clearInterval(this.timerHandle);
                return;
            }
            this.session.timeLeft--;
            if (this.session.timeLeft <= 0) {
                clearInterval(this.timerHandle);
                this.submitAnswer(null); // Timeout is incorrect
            }
        }, 1000);
    },

    generateDistractors(correctMeaning) {
        const distractors = [];
        const pool = this.distractorPool;

        // Safety check
        if (pool.length < 4) return pool.filter(m => m !== correctMeaning);

        let attempts = 0;
        while (distractors.length < 3 && attempts < 50) {
            const randomMeaning = pool[Math.floor(Math.random() * pool.length)];
            if (randomMeaning !== correctMeaning && !distractors.includes(randomMeaning)) {
                distractors.push(randomMeaning);
            }
            attempts++;
        }
        return distractors;
    },

    submitAnswer(selectedMeaning) {
        if (this.session.isAnswered) return;

        this.session.selectedOption = selectedMeaning;
        this.session.isAnswered = true;
        this.session.isCorrect = (selectedMeaning === this.session.correctOption);

        if (this.session.isCorrect) {
            // PK Mode Logic
            if (this.session.mode === 'pk') {
                const points = 10 + Math.floor(GameState.game.combo / 2);
                Actions.updatePKScore(true, points);

                // If online, emit score
                if (!this.botInterval) { // Simple check for online mode
                    SocketManager.updateScore(GameState.game.pk.userScore);
                } else {
                    this.checkPKWinner();
                }
            }

            // Reward Calculation
            const comboBonus = Math.floor(GameState.game.combo / 5) + 1;
            const xp = 10 * comboBonus;
            const coins = 1 + Math.floor(GameState.game.combo / 10);

            // Actions.addToLastSessionStats(xp, coins, 1); // Helper if we want real-time update, but batch is better.

            // Local tracking
            this.session.sessionXP += xp;
            this.session.sessionCoins += coins;
            this.session.sessionCorrect++;

            Actions.addXP(xp);
            Actions.incrementCombo();
            Actions.addCoins(coins);

            if (this.session.mode === 'learn') {
                GameState.game.todayLearned++;
            }

            // Sync Progress with Gamification
            if (GameState.user.id) {
                API.syncProgress(GameState.user.id, this.session.currentWord.id, 'MASTERED', xp, coins)
                    .then(res => {
                        if (res && res.user) {
                            Actions.setUser(res.user);

                            // Check for Level Up
                            if (res.leveledUp) {
                                Actions.showOverlay('levelUp', {
                                    level: res.user.level,
                                    rankTitle: res.user.rankTitle,
                                    rankIcon: res.user.rankIcon
                                });
                                this.playAudio('levelUp');
                            }

                            // Check for Achievements
                            if (res.achievements && res.achievements.length > 0) {
                                // Queue each unlocked achievement
                                res.achievements.forEach(ach => {
                                    Actions.showOverlay('achievement', ach);
                                });
                                this.playAudio('Achievement Unlocked!');
                            }
                        }
                    });
            }

            // Audio Feedback
            setTimeout(() => this.playAudio(this.session.currentWord.word), 300);
        } else {
            this.playAudio('wrong');
            Actions.resetCombo();

            // Sync Mistake even if 0 XP/Coins to track mistake count in DB
            if (GameState.user.id) {
                API.syncProgress(GameState.user.id, this.session.currentWord.id, 'LEARNING', 0, 0)
                    .then(res => {
                        if (res && res.user) {
                            Actions.setUser(res.user);
                        }
                    });
            }
        }

        // Auto advance delay
        setTimeout(() => {
            if (this.session.currentIndex < this.session.queue.length - 1) {
                this.session.currentIndex++;
                this.loadNextQuestion();
            } else {
                this.finishSession();
            }
        }, this.session.isCorrect ? 1500 : 2500); // Longer delay for error to see correct answer
    },

    _botLoop() {
        if (!GameState.game.pk.isActive) {
            clearInterval(this.botInterval);
            return;
        }

        // Simulating Bot answering
        // 80% chance to be correct
        const isCorrect = Math.random() > 0.2;
        if (isCorrect) {
            const points = 10 + Math.floor(Math.random() * 5); // 10-15 points
            Actions.updatePKScore(false, points);
        }

        this.checkPKWinner();
    },

    checkPKWinner() {
        const WIN_SCORE = 200; // First to 200 wins
        const pk = GameState.game.pk;

        if (pk.userScore >= WIN_SCORE) {
            Actions.endPK('user');
            if (this.botInterval) clearInterval(this.botInterval);
            this.playAudio('win');
        } else if (pk.opponent.score >= WIN_SCORE) {
            Actions.endPK('bot'); // Or opponent
            if (this.botInterval) clearInterval(this.botInterval);
            this.playAudio('loss');
        }
    },

    finishSession() {
        // Save stats to State for Result View
        Actions.setLastSession({
            xp: this.session.sessionXP,
            coins: this.session.sessionCoins,
            correct: this.session.sessionCorrect,
            total: this.session.queue.length
        });
        Actions.setView('result');
    },

    quitSession() {
        if (this.timerHandle) clearInterval(this.timerHandle);
        this.timerHandle = null;
        Actions.setView('dashboard');
    },

    _resetSessionStats() {
        this.session.sessionXP = 0;
        this.session.sessionCoins = 0;
        this.session.sessionCorrect = 0;
    },

    playAudio(text) {
        if (!GameState.settings.soundEnabled) return;

        // Special check for synthesized sound effects
        if (text === 'correct') return this.sounds.playCorrect();
        if (text === 'wrong') return this.sounds.playWrong();
        if (text === 'levelUp' || text === 'Congratulations!' || text === 'Achievement Unlocked!') return this.sounds.playLevelUp();
        if (text === 'win') return this.sounds.playWin();
        if (text === 'loss') return this.sounds.playLoss();

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    },

    // Synthetic Sound Generation using Web Audio API
    sounds: {
        _ctx: null,
        getContext() {
            if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            return this._ctx;
        },
        _playTone(freq, type, duration, volume = 0.1) {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        },
        playCorrect() {
            this._playTone(523.25, 'sine', 0.1, 0.2); // C5
            setTimeout(() => this._playTone(659.25, 'sine', 0.2, 0.2), 50); // E5
        },
        playWrong() {
            this._playTone(220, 'triangle', 0.3, 0.2); // A3
        },
        playLevelUp() {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((f, i) => {
                setTimeout(() => this._playTone(f, 'sine', 0.4, 0.2), i * 100);
            });
        },
        playWin() {
            this.playLevelUp();
        },
        playLoss() {
            this._playTone(196, 'sawtooth', 0.5, 0.1); // G3
            setTimeout(() => this._playTone(146.83, 'sawtooth', 0.5, 0.1), 200); // D3
        }
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
