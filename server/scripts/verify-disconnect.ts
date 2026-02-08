import { io } from "socket.io-client";

const URL = "http://localhost:3000/pk"; // Namespace PK

const client1 = io(URL, { autoConnect: false, transports: ['websocket'] });
const client2 = io(URL, { autoConnect: false, transports: ['websocket'] });

function connectClient(client: any, name: string) {
    return new Promise((resolve) => {
        client.on("connect", () => {
            console.log(`${name} connected: ${client.id}`);
            resolve(true);
        });
        client.connect();
    });
}

async function verify() {
    console.log("Starting Disconnect Verification...");

    await Promise.all([
        connectClient(client1, "Client 1"),
        connectClient(client2, "Client 2")
    ]);

    // Setup listeners
    client1.on("match_found", (data: any) => {
        console.log("Client 1 Match Found:", data.gameId);
    });

    client2.on("match_found", (data: any) => {
        console.log("Client 2 Match Found:", data.gameId);
        // Simulate disconnect after match found
        setTimeout(() => {
            console.log("Client 2 disconnecting...");
            client2.disconnect();
        }, 1000);
    });

    client1.on("game_over", (data: any) => {
        console.log("Client 1 Game Over:", data);
        if (data.isWin === true && data.reason === 'disconnect') {
            console.log("✅ Client 1 won by opponent disconnect!");
            process.exit(0);
        } else {
            console.error("❌ Unexpected Game Over data:", data);
            process.exit(1);
        }
    });

    // Join Queue
    console.log("Joining Queue...");
    client1.emit("join_queue", { id: "user1_d", username: "Player 1", avatar: "A" });
    setTimeout(() => {
        client2.emit("join_queue", { id: "user2_d", username: "Player 2", avatar: "B" });
    }, 500);

    // Timeout
    setTimeout(() => {
        console.error("❌ Verification Timed Out");
        process.exit(1);
    }, 8000);
}

verify();
