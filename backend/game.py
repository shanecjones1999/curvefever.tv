from backend.player import Player
import random


class Game:
    def __init__(self, players: list[Player]):
        self.players = players
        self.index = 0

    def move_players(self):
        for player in self.players:
            player.move(self.index)

        self.index += 1

    def reset(self):
        self.index = 0

    def to_dict(self):
        return [player.to_dict() for player in self.players]
