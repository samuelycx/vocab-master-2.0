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
        const rawWords = await API.getSessionWords(count);
        if (!rawWords || rawWords.length === 0) {
            uni.showModal({
                title: '提示',
                content: '数据库中暂无单词，请确保已正确导入词书！',
                showCancel: false
            });
            return;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            id: w._id || w.id,
            meanings: (typeof w.meanings === 'string') ? JSON.parse(w.meanings) : w.meanings,
            examples: (typeof w.examples === 'string') ? JSON.parse(w.examples) : w.examples
        }));

        this._setupSession(formattedWords, formattedWords, 'learn');
    },

    async startReview(userId) {
        const rawWords = await API.getReviews(userId);
        if (!rawWords || rawWords.length === 0) {
            uni.showModal({
                title: '提示',
                content: '目前没有待复习单词！请继续学习新词。',
                showCancel: false
            });
            return false;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            id: w._id || w.id,
            meanings: this._safeParse(w.meanings),
            examples: this._safeParse(w.examples)
        }));

        this._setupSession(formattedWords, formattedWords, 'review');
        return true;
    },

    async startMistake(userId) {
        const rawWords = await API.getMistakes(userId);
        if (!rawWords || rawWords.length === 0) {
            uni.showModal({
                title: '太棒了',
                content: '目前没有错题记录！',
                showCancel: false
            });
            return false;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            id: w._id || w.id,
            meanings: this._safeParse(w.meanings),
            examples: this._safeParse(w.examples)
        }));

        this._setupSession(formattedWords, formattedWords, 'mistake');
        return true;
    },

    async startPKSession() {
        const rawWords = await API.getSessionWords(50);
        if (!rawWords || rawWords.length === 0) return;

        // Format words
        const formattedWords = rawWords.map(w => ({
            ...w,
            id: w._id || w.id,
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
        GameState.game.pk.isSearching = true;
        SocketManager.joinQueue(GameState.user.id, GameState.user.username, GameState.user.avatar);
        Actions.setView('pk');
    },

    async startOnlinePK(gameId, opponent) {
        if (this.botInterval) clearInterval(this.botInterval);
        GameState.game.pk.isSearching = false;

        const rawWords = await API.getSessionWords(50);
        if (!rawWords || rawWords.length === 0) return;

        const formattedWords = rawWords.map(w => ({
            ...w,
            id: w._id || w.id,
            meanings: this._safeParse(w.meanings),
            examples: this._safeParse(w.examples)
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
                        const data = res?.data || res; // Handle both {data: user} and {user} formats
                        if (data && data.user) {
                            Actions.setUser(data.user);

                            // Check for Level Up
                            if (data.leveledUp) {
                                Actions.showOverlay('levelUp', {
                                    level: data.user.level,
                                    rankTitle: data.user.rankTitle,
                                    rankIcon: data.user.rankIcon
                                });
                                this.playAudio('success');
                            }

                            // Check for Achievements
                            if (data.achievements && data.achievements.length > 0) {
                                data.achievements.forEach(ach => {
                                    Actions.showOverlay('achievement', ach);
                                });
                                this.playAudio('success');
                            }
                        }
                    });
            }

            // Audio Feedback
            setTimeout(() => this.playAudio(this.session.currentWord.word), 300);
        } else {
            this.playAudio('wrong');
            Actions.resetCombo();

            if (GameState.user.id) {
                API.syncProgress(GameState.user.id, this.session.currentWord.id, 'LEARNING', 0, 0)
                    .then(res => {
                        const data = res?.data || res;
                        if (data && data.user) {
                            Actions.setUser(data.user);
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
        }, this.session.isCorrect ? 1500 : 2500);
    },

    _botLoop() {
        if (!GameState.game.pk.isActive) {
            if (this.botInterval) clearInterval(this.botInterval);
            return;
        }

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
            Actions.endPK('bot');
            if (this.botInterval) clearInterval(this.botInterval);
            this.playAudio('loss');
        }
    },

    finishSession() {
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
        // Mocking them for now or using a simple sound file if available
        // In Mini Program, we use uni.createInnerAudioContext
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;

        if (text === 'correct' || text === 'success') {
            // You can use a local path if you have assets, or a remote one
            return;
        }
        if (text === 'wrong') return;
        if (text === 'win') return;
        if (text === 'loss') return;

        // English Pronunciation using Youdao TTS API
        innerAudioContext.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
        innerAudioContext.onPlay(() => {
            console.log('Start playing pronunciation');
        });
        innerAudioContext.onEnded(() => {
            this._destroyAudio(innerAudioContext);
        });
        innerAudioContext.onError((res) => {
            console.error('[Audio Error]', res.errMsg);
            this._destroyAudio(innerAudioContext);
        });
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    _safeParse(data) {
        if (typeof data !== 'string') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('JSON Parse Error:', e, data);
            return [];
        }
    },

    _destroyAudio(context) {
        if (context) {
            context.destroy();
        }
    }
};
