class Player {
    constructor(playerId, color, radius, x, y) {
        this.ctx = ctx;
        this.playerId = playerId;
        this.color = color;
        this.radius = radius;
        this.trail = new Trail();
        this.trail.addSegment();
        this.x = x;
        this.y = y;
        this.hasTrail = true;
    }

    updatePosition(x, y, hasTrail, addSegment) {
        this.x = x;
        this.y = y;
        this.hasTrail = hasTrail;
        if (addSegment) {
            this.trail.addSegment();
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        this.drawTrail(ctx);

        const point = new Point(this.x, this.y, this.radius);

        if (this.hasTrail) {
            this.trail.addPoint(point);
        }
    }

    drawTrail(ctx) {
        this.trail.draw(ctx, this.color);
    }
}

class Trail {
    constructor() {
        this.segments = [];
    }

    addPoint(point) {
        this.segments[0].addPoint(point);
    }

    draw(ctx, color) {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].draw(ctx, color);
        }
    }

    addSegment() {
        const segment = new Segment();
        this.segments = [segment, ...this.segments];
    }
}

class Segment {
    constructor() {
        this.points = [];
    }

    addPoint(point) {
        this.points = [point, ...this.points];
    }

    draw(ctx, color) {
        if (this.points.length < 2) {
            return;
        }

        ctx.beginPath();
        ctx.strokeStyle = color;

        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];
            ctx.lineWidth = point.radius * 2;
            ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
        ctx.closePath();
    }
}

class Point {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
