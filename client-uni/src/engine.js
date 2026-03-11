import { SocketManager } from './socket.js';

import { reactive } from 'vue';
import { GameState, Actions } from './state.js';
import { API } from './api.js';
import { translate } from './i18n.js';

const CORRECT_DELAY_MS = 2600;
const WRONG_DELAY_MS = 3600;
const tr = (key, params) => translate(GameState.settings.language || 'zh-CN', key, params);

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
        lastAwardXP: 0,
        lastAwardCoins: 0,
        mode: 'learn' // learn, review, mistake, pk
    }),

    wordMap: {},
    distractorPool: [],
    timerHandle: null,
    botInterval: null,
    autoPlayHandle: null,
    audioContext: null,
    lastAudioKey: '',
    lastAudioAt: 0,

    async startSession(count = 10) {
        const rawWords = await API.getSessionWords(count);
        if (!rawWords || rawWords.length === 0) {
            uni.showModal({
                title: tr('common_notice'),
                content: tr('common_no_words_db'),
                showCancel: false
            });
            return;
        }

        const formattedWords = rawWords.map(w => ({
            ...w,
            id: w._id || w.id,
            meanings: this._safeParse(w.meanings),
            examples: this._safeParse(w.examples)
        }));

        this._setupSession(formattedWords, formattedWords, 'learn');
    },

    async startReview(userId) {
        const rawWords = await API.getReviews(userId);
        if (!rawWords || rawWords.length === 0) {
            uni.showModal({
                title: tr('dashboard_review'),
                content: tr('dashboard_no_reviews'),
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
                title: tr('common_notice'),
                content: tr('common_no_mistakes'),
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
            meanings: this._safeParse(w.meanings),
            examples: this._safeParse(w.examples)
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
        const uid = GameState.user.id || GameState.user._id || GameState.user.openid;
        if (!uid) {
            uni.showToast({ title: tr('dashboard_login_first'), icon: 'none' });
            return;
        }
        SocketManager.joinQueue(uid, GameState.user.username, GameState.user.avatar);
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
        if (this.autoPlayHandle) clearTimeout(this.autoPlayHandle);
        this.autoPlayHandle = null;
        this.lastAudioKey = '';
        this.lastAudioAt = 0;

        const safeQueueWords = (queueWords || [])
            .filter(w => w && typeof w.text === 'string' && w.text.trim())
            .map(w => ({
                ...w,
                text: String(w.text).trim(),
                meanings: Array.isArray(w.meanings) ? w.meanings.filter(Boolean) : [],
                examples: Array.isArray(w.examples) ? w.examples.filter(Boolean) : []
            }))
            .filter(w => w.meanings.length > 0);

        if (safeQueueWords.length === 0) {
            uni.showModal({
                title: tr('common_notice'),
                content: tr('common_no_words_db'),
                showCancel: false
            });
            Actions.setView('dashboard');
            return;
        }

        this.session.queue = safeQueueWords.map(w => w.text);
        this.wordMap = safeQueueWords.reduce((acc, w) => {
            acc[w.text] = w;
            return acc;
        }, {});

        // Use poolWords for distractors.
        this.distractorPool = (poolWords || [])
            .map(w => (Array.isArray(w?.meanings) ? w.meanings[0] : ''))
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
        this.scheduleAutoPlay(this.session.currentWord.word);
    },

    scheduleAutoPlay(text) {
        if (this.autoPlayHandle) clearTimeout(this.autoPlayHandle);
        if (!text) return;
        this.autoPlayHandle = setTimeout(() => {
            this.playAudio(text, { dedupeWindowMs: 800 });
        }, 120);
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
        this.session.lastAwardXP = 0;
        this.session.lastAwardCoins = 0;

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
            this.session.lastAwardXP = xp;
            this.session.lastAwardCoins = coins;

            Actions.addXP(xp);
            Actions.incrementCombo();
            Actions.addCoins(coins);

            if (this.session.mode === 'learn') {
                GameState.game.todayLearned++;
            }

            // Sync Progress with Gamification
            const uid = GameState.user.id || GameState.user._id || GameState.user.openid;
            if (uid) {
                API.syncProgress(
                    uid,
                    this.session.currentWord.id,
                    'MASTERED',
                    xp,
                    coins,
                    GameState.game.combo
                )
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

        } else {
            this.playAudio('wrong');
            Actions.resetCombo();

            const uid = GameState.user.id || GameState.user._id || GameState.user.openid;
            if (uid) {
                API.syncProgress(uid, this.session.currentWord.id, 'LEARNING', 0, 0, 0)
                    .then(res => {
                        const data = res?.data || res;
                        if (data && data.user) {
                            Actions.setUser(data.user);
                        }
                    });
            }
        }

        // Auto advance delay (longer for flipped feedback readability)
        setTimeout(() => {
            if (this.session.currentIndex < this.session.queue.length - 1) {
                this.session.currentIndex++;
                this.loadNextQuestion();
            } else {
                this.finishSession();
            }
        }, this.session.isCorrect ? CORRECT_DELAY_MS : WRONG_DELAY_MS);
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
        if (this.timerHandle) clearInterval(this.timerHandle);
        this.timerHandle = null;
        if (this.autoPlayHandle) clearTimeout(this.autoPlayHandle);
        this.autoPlayHandle = null;
        this._destroyAudio(this.audioContext);
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
        if (this.autoPlayHandle) clearTimeout(this.autoPlayHandle);
        this.autoPlayHandle = null;
        this._destroyAudio(this.audioContext);
        Actions.setView('dashboard');
    },

    _resetSessionStats() {
        this.session.sessionXP = 0;
        this.session.sessionCoins = 0;
        this.session.sessionCorrect = 0;
        this.session.lastAwardXP = 0;
        this.session.lastAwardCoins = 0;
    },

    playAudio(text, { dedupeWindowMs = 0 } = {}) {
        if (!GameState.settings.soundEnabled) return;
        const normalizedText = String(text || '').trim();
        if (!normalizedText) return;

        const now = Date.now();
        const audioKey = normalizedText.toLowerCase();
        if (dedupeWindowMs > 0 && this.lastAudioKey === audioKey && (now - this.lastAudioAt) < dedupeWindowMs) {
            return;
        }
        this.lastAudioKey = audioKey;
        this.lastAudioAt = now;

        if (normalizedText === 'correct' || normalizedText === 'success') {
            return;
        }
        if (normalizedText === 'wrong') return;
        if (normalizedText === 'win') return;
        if (normalizedText === 'loss') return;

        // Only one TTS context should exist at a time; destroy the previous one first.
        this._destroyAudio(this.audioContext);
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        this.audioContext = innerAudioContext;

        // English Pronunciation using Youdao TTS API
        innerAudioContext.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(normalizedText)}&type=2`;
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
        if (Array.isArray(data)) {
            return data.map(v => String(v || '').trim()).filter(Boolean);
        }
        if (typeof data !== 'string') return [];
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                return parsed.map(v => String(v || '').trim()).filter(Boolean);
            }
            return [];
        } catch (e) {
            const text = String(data || '').trim();
            if (!text) return [];
            // Backward compatibility for legacy delimiter format.
            return text.split(/[；;|]/).map(v => v.trim()).filter(Boolean);
        }
    },

    _destroyAudio(context) {
        if (context) {
            context.destroy();
            if (this.audioContext === context) {
                this.audioContext = null;
            }
        }
    }
    ,
    stopAudio() {
        if (this.autoPlayHandle) clearTimeout(this.autoPlayHandle);
        this.autoPlayHandle = null;
        this._destroyAudio(this.audioContext);
    }
};
