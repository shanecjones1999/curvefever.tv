document.getElementById("nameForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const playerName = document.getElementById("playerName").value.trim();

    if (playerName) {
        localStorage.setItem("playerName", playerName);

        window.location.href = "game.html";
    } else {
        alert("Please enter a valid name.");
    }
});
