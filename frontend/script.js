const canvas = document.getElementById("gameCanvas"),
    ctx = canvas.getContext("2d"),
    playerName = localStorage.getItem("playerName");

if (playerName) {
    document.getElementById("playerNameDisplay").innerText = playerName;
} else {
    window.location.href = "/";
}
let socketUrl = "wss://curvefever-tv.onrender.com/ws";

if (window.location.href == "http://127.0.0.1:8000/game") {
    socketUrl = "ws://127.0.0.1:8000/ws";
}

const playerList = document.getElementById("playerList");
const ws = new WebSocket(socketUrl);

const players = {},
    keysPressed = {};
let playerId = null,
    game = null;

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
        const player = players[data.player.id],
            updates = data.player;
        player.updatePosition(
            updates.x,
            updates.y,
            updates.hasTrail,
            updates.createNewSegment
        );
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

        game = new Game(ctx, players);

        this.initializeGame();
    }
};

function initializeGame() {
    document.getElementById("lobby").style.display = "none";
    document.getElementById("game").style.display = "block";

    startGame();
}

function startGame() {
    requestAnimationFrame(render);
}

ws.onclose = () => {
    alert("Connection to server lost.");
    window.location.href = "index";
};

document.getElementById("startGameBtn").addEventListener("click", () => {
    ws.send(
        JSON.stringify({
            type: "start_game",
            playerName: playerName,
        })
    );
});

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

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.drawPlayers();

    requestAnimationFrame(render);
}
