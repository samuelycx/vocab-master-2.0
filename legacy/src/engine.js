import { reactive } from 'vue';
import { VOCABULARY } from './data/vocab.js';
import { GameState, Actions } from './state.js';

export const GameEngine = {
    // Current session state - Reactive source of truth
    session: reactive({
        queue: [],
        currentIndex: 0,
        currentWord: null,
        correctOption: null,
        options: [],
        isAnswered: false,
        isCorrect: false
    }),

    startSession(count = 10) {
        Actions.resetCombo();
        // Simple random selection for now (Phase 1)
        const keys = Object.keys(VOCABULARY);
        const selectedKeys = [];

        for (let i = 0; i < count; i++) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            selectedKeys.push(randomKey);
        }

        this.session.queue = selectedKeys;
        this.session.currentIndex = 0;
        this.loadNextQuestion();

        Actions.setView('arena'); // Switch to Game View
    },

    loadNextQuestion() {
        if (this.session.currentIndex >= this.session.queue.length) {
            this.finishSession();
            return;
        }

        const wordKey = this.session.queue[this.session.currentIndex];
        const wordData = VOCABULARY[wordKey];

        this.session.currentWord = {
            word: wordKey,
            ...wordData
        };

        // Generate Options
        const correctMeaning = wordData.meanings[0];
        const distractors = this.generateDistractors(correctMeaning);

        this.session.correctOption = correctMeaning;
        this.session.options = this.shuffleArray([correctMeaning, ...distractors]);
        this.session.isAnswered = false;
        this.session.isCorrect = false;
    },

    generateDistractors(correctMeaning) {
        const allMeanings = Object.values(VOCABULARY).map(v => v.meanings[0]);
        const distractors = [];
        while (distractors.length < 3) {
            const randomMeaning = allMeanings[Math.floor(Math.random() * allMeanings.length)];
            if (randomMeaning !== correctMeaning && !distractors.includes(randomMeaning)) {
                distractors.push(randomMeaning);
            }
        }
        return distractors;
    },

    submitAnswer(selectedMeaning) {
        if (this.session.isAnswered) return;

        this.session.isAnswered = true;
        this.session.isCorrect = (selectedMeaning === this.session.correctOption);

        if (this.session.isCorrect) {
            Actions.addXP(10 + (GameState.game.combo * 2)); // Combo bonus
            Actions.incrementCombo();
            Actions.addCoins(1);
            GameState.game.todayLearned++;

            // Audio Feedback
            this.playAudio(this.session.currentWord.word);
        } else {
            Actions.resetCombo();
            // TODO: Add to wrong words list
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

    finishSession() {
        Actions.setView('result');
    },

    playAudio(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
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
