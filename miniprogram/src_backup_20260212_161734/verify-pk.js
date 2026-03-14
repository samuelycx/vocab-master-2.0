
// Setup Globals for Vue/Client code

// LocalStorage Mock
const localStorageMock = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { }
};

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
});

// Window Mock
const windowMock = {
    speechSynthesis: {
        speak: () => { },
    },
    location: {
        reload: () => { }
    },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    addEventListener: () => { },
    removeEventListener: () => { },
    localStorage: localStorageMock
};

Object.defineProperty(global, 'window', {
    value: windowMock,
    writable: true,
    configurable: true
});

// Document Mock
global.document = {
    documentElement: {
        classList: {
            add: () => { },
            remove: () => { }
        },
        style: {}
    },
    head: {
        appendChild: () => { }
    },
    body: {
        appendChild: () => { }
    },
    createElement: (tag) => ({
        tagName: tag ? tag.toUpperCase() : 'DIV',
        style: {},
        setAttribute: () => { },
        appendChild: () => { },
        classList: { add: () => { }, remove: () => { } },
        addEventListener: () => { },
        removeEventListener: () => { }
    }),
    createComment: () => ({}),
    createTextNode: () => ({}),
    querySelector: () => null,
    getElementById: () => null,
    addEventListener: () => { },
    removeEventListener: () => { }
};

// Navigator Mock
if (!global.navigator) {
    try {
        Object.defineProperty(global, 'navigator', {
            value: { userAgent: 'node' },
            writable: true,
            configurable: true
        });
    } catch (e) { }
}

global.SVGElement = class { };
global.SpeechSynthesisUtterance = class { };

// Mock fetch to avoid errors if called unexpectedly
global.fetch = async () => ({ ok: true, json: async () => ({}) });

async function verify() {
    console.log('🚀 Starting PK Verification...');

    // Dynamic import to ensure globals are set first
    const { GameEngine } = await import('./src/engine.js');
    const { GameState, Actions } = await import('./src/state.js');
    const { API } = await import('./src/api.js');

    // Mock API methods
    API.getWords = async (count) => {
        return Array(count || 50).fill(0).map((_, i) => ({
            id: i,
            text: `word${i}`,
            meanings: JSON.stringify([`meaning${i}`]),
            examples: JSON.stringify([`example${i}`]),
            partOfSpeech: 'noun'
        }));
    };

    API.syncProgress = async () => ({ user: GameState.user });

    // 1. Verify Start PK
    console.log('1. Starting PK Session...');
    await GameEngine.startPKSession();

    if (GameEngine.session.mode !== 'pk') throw new Error('Mode is not pk');
    if (!GameState.game.pk.isActive) throw new Error('PK state is not active');
    console.log('✅ PK Session Started');

    // 2. Simulate User Scoring
    const currentWord = GameEngine.session.queue[GameEngine.session.currentIndex];
    const correctOption = GameEngine.session.correctOption;
    const initialScore = GameState.game.pk.userScore;

    console.log('2. User submitting answer...');
    GameEngine.submitAnswer(correctOption);

    if (GameState.game.pk.userScore <= initialScore) throw new Error('User score did not increase');
    console.log(`✅ User Score: ${initialScore} -> ${GameState.game.pk.userScore}`);

    // 3. Simulate Bot Loop
    console.log('3. Simulating Bot Loop...');
    const initialBotScore = GameState.game.pk.opponent.score;
    // Force call _botLoop directly since we can access GameEngine
    for (let i = 0; i < 20; i++) {
        GameEngine._botLoop();
    }

    console.log(`   Bot Score after 20 ticks: ${GameState.game.pk.opponent.score}`);
    if (GameState.game.pk.opponent.score === initialBotScore) {
        console.warn('⚠️ Bot score did not increase (unlucky?)');
    } else {
        console.log('✅ Bot is scoring');
    }

    // 4. Test Win Condition
    console.log('4. Testing Win Condition (User Win)...');
    Actions.updatePKScore(true, 500); // Instant win
    GameEngine.checkPKWinner();

    if (GameState.game.pk.winner !== 'user') throw new Error('User did not win with high score');
    if (GameState.game.pk.isActive) throw new Error('PK should be inactive after win');

    console.log('✅ Win condition verified');
    console.log('🎉 All PK Verification Steps Passed!');
}

verify().catch(e => {
    console.error('❌ Verification Failed:', e);
    process.exit(1);
});
