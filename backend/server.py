from backend.player import Player
from backend.game import Game
from fastapi import FastAPI, WebSocket
import json
import math
import asyncio

app = FastAPI()

connected_players: dict[str, Player] = {}
game: Game = None

move_players_task = None
ROTATION_SPEED = math.radians(20)


async def move_players():
    while True:
        game.move_players()
        for player in connected_players.values():
            for other_player in connected_players.values():
                await other_player.websocket.send_text(json.dumps({
                    "type": "player_move",
                    "player": player.to_dict()
                }))
        await asyncio.sleep(0.016)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    player_id = str(id(websocket))

    try:

        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)

                if message["type"] == "start_game":
                    global game
                    game = Game(list(connected_players.values()))
                    global move_players_task
                    if move_players_task is None or move_players_task.done():
                        move_players_task = asyncio.create_task(move_players())
                    for player in connected_players.values():
                        await player.websocket.send_text(json.dumps({
                            "type": "initialize_game",
                            "players": game.to_dict()
                        }))

                elif message["type"] == "join_lobby":
                    player_name = message["playerName"]
                    player_id = str(id(websocket))

                    player = Player(id=player_id, name=player_name,
                                    websocket=websocket)
                    connected_players[player_id] = player

                    for player in connected_players.values():
                        await player.websocket.send_text(json.dumps({
                            "type": "update_lobby",
                            "players": [player.name for player in connected_players.values()]
                        }))
                elif message["type"] == "key_update":
                    player = connected_players[message['id']]
                    if message["keys"].get("ArrowRight"):
                        player.right_pressed = True
                    else:
                        player.right_pressed = False
                    if message["keys"].get("ArrowLeft"):
                        player.left_pressed = True
                    else:
                        player.left_pressed = False

            except Exception as e:
                print(f"Error receiving data: {e}")
                break

    except Exception as e:
        print(f"Connection error: {e}")

    finally:
        player_id = str(id(websocket))

        if player_id:
            del connected_players[player_id]

            for client in connected_players.values():
                await client.websocket.send_text(json.dumps({
                    "type": "update_lobby",
                    "players": [player.name for player in connected_players.values()]
                }))
