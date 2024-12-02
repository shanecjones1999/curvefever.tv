import math
import random

MOVEMENT_SPEED = 2
ROTATION_SPEED = math.radians(20)


class Player:
    def __init__(self, player_id: str):
        self.player_id = player_id
        self.x = random.randint(150, 300)
        self.y = random.randint(150, 300)
        self.angle = 0
        self.speed = MOVEMENT_SPEED
        self.is_moving = True

    def move(self):
        self.x += math.cos(self.angle) * MOVEMENT_SPEED
        self.y += math.sin(self.angle) * MOVEMENT_SPEED

    def to_dict(self):
        return {
            "playerId": self.player_id,
            "x": self.x,
            "y": self.y,
            "angle": self.angle,
            "speed": self.speed
        }
