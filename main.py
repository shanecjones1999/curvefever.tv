from fastapi import FastAPI, WebSocket
import json
import math
import asyncio
from client import Client
from player import Player

app = FastAPI()

connected_clients: dict[str, Client] = {}

MOVEMENT_SPEED = 2
ROTATION_SPEED = math.radians(20)


move_players_task = None


async def move_players():
    while True:
        for client in connected_clients.values():
            player = client.player
            player.move()

            for other_client in connected_clients.values():
                await other_client.websocket.send_text(json.dumps({
                    "type": "player_move",
                    "player": player.to_dict()
                }))
        await asyncio.sleep(0.016)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global move_players_task
    await websocket.accept()
    player_id = str(id(websocket))

    player = Player(player_id)
    client = Client(player, websocket)
    connected_clients[player_id] = client

    if move_players_task is None or move_players_task.done():
        move_players_task = asyncio.create_task(move_players())

    try:
        async def handle_client_updates():
            while True:
                try:
                    data = await websocket.receive_text()
                    message = json.loads(data)

                    if message["type"] == "player_move":
                        direction = message["direction"]
                        if direction == "left":
                            client.player.angle -= ROTATION_SPEED
                        elif direction == "right":
                            client.player.angle += ROTATION_SPEED
                        elif direction == "none":
                            pass

                        client.player.angle %= (2 * math.pi)

                except asyncio.exceptions.IncompleteReadError:
                    print(f"Player {player_id} disconnected abruptly.")
                    break
                except Exception as e:
                    print(f"Error handling client {player_id}")
                    break

        client.assign_task(handle_client_updates())
        await client.task

    except Exception as e:
        print(f"Connection closed unexpectedly for player {player_id}: {e}")

    finally:
        await client.cancel_task()
        del connected_clients[player_id]
        print(
            f"Deleted player {player_id}. Connected clients: {len(connected_clients)}")

        if not connected_clients and move_players_task:
            move_players_task.cancel()
            try:
                await move_players_task
            except asyncio.CancelledError:
                print("move_players task cancelled.")
