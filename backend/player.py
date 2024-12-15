from fastapi import WebSocket
import random
import math

MOVEMENT_SPEED = 2
ROTATION_SPEED = math.radians(3)


class Player:
    def __init__(self, id: str, name: str, websocket: WebSocket):
        self.id: str = id
        self.name: str = name
        self.websocket = websocket
        self.x = random.randint(150, 300)
        self.y = random.randint(150, 300)
        self.angle = 0
        self.speed = 2
        self.is_moving = True
        self.trail = Trail()
        self.color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
        self.left_pressed = False
        self.right_pressed = False
        self.has_trail = True
        self.skip_index_start = 0
        self.create_new_segment = False

    def move(self, game_index):
        self.create_new_segment = False

        if self.left_pressed:
            self.angle -= ROTATION_SPEED
        elif self.right_pressed:
            self.angle += ROTATION_SPEED

        self.x += math.cos(self.angle) * MOVEMENT_SPEED
        self.y += math.sin(self.angle) * MOVEMENT_SPEED

        if self.x > 800:
            self.create_new_segment = True
            self.trail.add_segment()
            self.x = 0
        if self.x < 0:
            self.create_new_segment = True
            self.trail.add_segment()
            self.x = 800
            self.trail.add_segment()
        if self.y < 0:
            self.create_new_segment = True
            self.trail.add_segment()
            self.y = 600
        if self.y > 600:
            self.create_new_segment = True
            self.trail.add_segment()
            self.y = 0

        if self.has_trail and random.randint(1, 250) == 1:
            self.has_trail = False
            self.skip_index_start = game_index

        elif not self.has_trail and game_index == self.skip_index_start + 15:
            self.create_new_segment = True
            self.has_trail = True

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "x": self.x,
            "y": self.y,
            "color": self.color,
            "hasTrail": self.has_trail,
            "createNewSegment": self.create_new_segment
        }


class Trail:
    def __init__(self):
        self.segments: list[TrailSegment] = [TrailSegment()]

    def add_point(self, x: int, y: int):
        point = Point(x, y)

        last_segment = self.segments[len(self.segments) - 1]
        last_segment.add_point(point)

    def add_segment(self):
        segment = TrailSegment()
        self.segments.append(segment)

    def to_dict(self):
        segments = []

        for i in range(len(self.segments)):
            segment = self.segments[i].to_dict()
            segments.append(segment)

        return {
            "segments": segments
        }


class TrailSegment:
    def __init__(self):
        self.points: list[Point] = []

    def add_point(self, point: "Point"):
        self.points.append(point)

    def to_dict(self):
        points = []
        for i in range(len(self.points)):
            points.append(self.points[i].to_dict())

        return {
            "points": points
        }


class Point:

    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y
        self.width = 5

    def to_dict(self):
        return {
            "x": self.x,
            "y": self.y,
        }
