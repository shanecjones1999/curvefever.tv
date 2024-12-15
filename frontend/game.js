const canvas = document.getElementById("gameCanvas"),
    ctx = canvas.getContext("2d");

const playerName = localStorage.getItem("playerName");
if (playerName) {
    document.getElementById("playerNameDisplay").innerText = playerName;
} else {
    window.location.href = "index.html";
}

const playerList = document.getElementById("playerList");
const ws = new WebSocket("wss://curvefever-tv.onrender.com/ws");

let players = {};

ws.onopen = () => {
    console.log("Connected to server");
    const joinMessage = {
        type: "join_lobby",
        playerName: playerName,
    };

    ws.send(JSON.stringify(joinMessage));
};

ws.onerror = (error) => {
    console.log("WebSocket Error: ", error);
};

ws.onopen = () => {
    ws.send(
        JSON.stringify({
            type: "join_lobby",
            playerName: playerName,
        })
    );
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "update_lobby") {
        playerList.innerHTML = "";
        data.players.forEach((player) => {
            const li = document.createElement("li");
            li.textContent = player;
            playerList.appendChild(li);
        });
    } else if (data.type === "player_move") {
        const player = players[data.player.id];
        player.x = data.player.x;
        player.y = data.player.y;
        player.hasTrail = data.player.hasTrail;
        if (data.player.createNewSegment) {
            player.trail.addSegment();
        }
        // players[data.player.id].x = data.player.x;
        // players[data.player.id].y = data.player.y;
    } else if (data.type === "initialize_game") {
        data.players.forEach((player) => {
            if (player.name == playerName) {
                playerId = player.id;
            }
            const newPlayer = new Player(
                player.id,
                player.color,
                7,
                player.x,
                player.y
            );
            players[player.id] = newPlayer;
        });
        this.initializeGame();
    }
};

function initializeGame() {
    document.getElementById("lobby").style.display = "none"; // Assuming you have a 'lobby' div
    document.getElementById("game").style.display = "block"; // Assuming you have a 'game' div

    startGame();
}
let playerId = null;

function startGame() {
    console.log("Game is starting...");
    requestAnimationFrame(render);
}

ws.onclose = () => {
    alert("Connection to server lost.");
    window.location.href = "index.html";
};

document.getElementById("startGameBtn").addEventListener("click", () => {
    ws.send(
        JSON.stringify({
            type: "start_game",
            playerName: playerName,
        })
    );
});

const keysPressed = {};

document.addEventListener("keydown", (event) => {
    if (event.key == "ArrowRight" || event.key == "ArrowLeft") {
        keysPressed[event.key] = true;
        sendKeyStateToServer();
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key == "ArrowRight" || event.key == "ArrowLeft") {
        keysPressed[event.key] = false;
        sendKeyStateToServer();
    }
});

function sendKeyStateToServer() {
    ws.send(
        JSON.stringify({
            type: "key_update",
            keys: keysPressed,
            id: playerId,
        })
    );
}

// RENDER

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const playerId in players) {
        const player = players[playerId];
        player.draw(ctx);
    }

    requestAnimationFrame(render);
}
