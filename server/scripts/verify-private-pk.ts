import { io } from 'socket.io-client';

async function verifyPrivatePK() {
    console.log('--- Private PK Verification ---');
    const socket1 = io('http://localhost:3000/pk', { transports: ['websocket'] });
    const socket2 = io('http://localhost:3000/pk', { transports: ['websocket'] });

    const user1 = { id: 'user1', username: 'Player1', avatar: '👤' };
    const user2 = { id: 'user2', username: 'Player2', avatar: '👤' };

    let inviteCode = '';

    socket1.on('connect', () => {
        console.log('Player 1 connected');
        socket1.emit('create_private', user1);
    });

    socket1.on('private_created', (data) => {
        inviteCode = data.inviteCode;
        console.log('Private Match Created! Code:', inviteCode);

        // Player 2 joins
        socket2.connect();
    });

    socket2.on('connect', () => {
        console.log('Player 2 connected');
        socket2.emit('join_private', { ...user2, inviteCode });
    });

    socket1.on('match_found', (data) => {
        console.log('Match Found for P1! Opponent:', data.opponent.username);
    });

    socket2.on('match_found', (data) => {
        console.log('Match Found for P2! Opponent:', data.opponent.username);
        console.log('Private Match Logic: PASS');
        process.exit(0);
    });

    socket1.on('error', (err) => {
        console.error('P1 Error:', err.message);
        process.exit(1);
    });

    socket2.on('error', (err) => {
        console.error('P2 Error:', err.message);
        process.exit(1);
    });

    setTimeout(() => {
        console.error('Timeout waiting for match');
        process.exit(1);
    }, 10000);
}

verifyPrivatePK();
