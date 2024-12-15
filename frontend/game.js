class Game {
    constructor(ctx, players) {
        this.ctx = ctx;
        this.players = players;
    }

    drawPlayers() {
        for (playerId in this.players) {
            const player = this.players[playerId];
            player.draw(this.ctx);
        }
    }
}
