from player import Player
from fastapi import WebSocket


class Client:
    def __init__(self, player: Player, websocket: WebSocket):
        self.player = player
        self.websocket = websocket
        self.task = None

    def assign_task(self, task):
        self.task = task

    async def cancel_task(self):
        if self.task is not None:
            self.task.close()
            try:
                await self.task
            except Exception:
                print(f"Task for player {self.player.player_id} cancelled.")
            self.task = None
