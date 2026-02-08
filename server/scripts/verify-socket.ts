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
    console.log("Starting Socket (PK Namespace) Verification...");

    await Promise.all([
        connectClient(client1, "Client 1"),
        connectClient(client2, "Client 2")
    ]);

    // Setup listeners
    client1.on("match_found", (data: any) => {
        console.log("Client 1 Match Found:", data);
        if (data.opponent.username === "Player 2") {
            console.log("✅ Client 1 matched correctly!");
            // Send score update
            setTimeout(() => {
                console.log("Client 1 sending score 10...");
                client1.emit("update_score", { score: 10 });
            }, 1000);
        }
    });

    client2.on("match_found", (data: any) => {
        console.log("Client 2 Match Found:", data);
        if (data.opponent.username === "Player 1") {
            console.log("✅ Client 2 matched correctly!");
        }
    });

    client2.on("opponent_score", (data: any) => {
        console.log("Client 2 received opponent score:", data);
        if (data.score === 10) {
            console.log("✅ Client 2 received score update correctly!");
            process.exit(0);
        }
    });

    // Join Queue (needs ID now)
    console.log("Joining Queue...");
    client1.emit("join_queue", { id: "user1", username: "Player 1", avatar: "A" });
    setTimeout(() => {
        client2.emit("join_queue", { id: "user2", username: "Player 2", avatar: "B" });
    }, 500);

    // Timeout
    setTimeout(() => {
        console.error("❌ Verification Timed Out");
        process.exit(1);
    }, 5000);
}

verify();
