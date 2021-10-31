class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(pt) {
        return (this.x == pt.x) && (this.y == pt.y);
    }
}

class Segment {
    constructor(p1, p2) {
        if (p1.x < p2.x) {
            this.start = p1;
            this.end = p2;
        } else {
            this.start = p2;
            this.end = p1;
        }
        this.m = (this.end.y - this.start.y) / (this.end.x - this.start.x)
        this.b = pt1.y - this.m * pt1.x
    }

    equals(seg) {
        return (this.pt1.equals(seg.pt1)) && (this.pt2.equals(seg.pt2));
    }

    getYpos(xpos) {
        return this.m * xpos + this.b;
    }

    draw(color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
    }

    compare(pt) {
        let ypos = this.m * pt.x + this.b;
        if(pt.y > ypos) {
            return 1;
        }
        else if(pt.y < ypos) {
            return -1;
        }
        else {
            return 0;
        }
    }
}

class Visualization {
    constructor(data) {
        this.data = data;
        this.segments = [];
        this.highlighted_segment = null;
        this.unpause_resolvers = [];
    }

    draw() {
        // setup the canvas transform
        // TODO: have this adapt to the data and canvas size
        ctx.resetTransform();
        ctx.translate(0, canvas.height);
        const scale = 6;
        ctx.scale(scale, -scale);

        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw the bounding box
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / scale;
        ctx.strokeRect(this.data.x_min, this.data.y_min, this.data.x_max - this.data.x_min, this.data.y_max - this.data.y_min);

        // draw the segments
        ctx.lineCap = 'round';
        ctx.lineWidth = 5 / scale;
        for (const segment of this.segments) {
            const color = this.highlighted_segment === segment ? 'blue' : 'gray';
            segment.draw(color);
        }
    }

    start() {
        // set up the step_button event handler that unpauses the visualization
        this.step_handler = () => {
            this.unpause_resolvers.forEach(resolve => resolve());
            this.unpause_resolvers = [];
        };
        step_button.addEventListener('click', this.step_handler);
    }

    async draw_and_pause() {
        this.draw();
        return new Promise(resolve => this.unpause_resolvers.push(resolve));
    }

    finished() {
        this.draw();
        step_button.textContent = 'Done';
        step_button.disabled = true;
        step_button.removeEventListener('click', this.step_handler);
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/** @type HTMLCanvasElement */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const step_button = document.getElementById('step_button');

document.addEventListener('DOMContentLoaded', () => {
    canvas.width = 800;
    canvas.height = 600;

    const data = INPUT_FILES['qt2393'];
    const segments = data.segments.map(s =>
        new Segment(new Point(s.x1, s.y1), new Point(s.x2, s.y2)));
    const visualization = new Visualization(data);
    visualization.draw();

    function start() {
        step_button.removeEventListener('click', start);
        step_button.textContent = 'Step';
        visualization.start();
        algorithm(visualization, segments);
    }
    step_button.addEventListener('click', start);
});


async function algorithm(vis, segments) {
    for (const segment of segments) {
        // do some algorithm work, e.g. add the segment to the trapezoidal map
        //...

        // update the visualization and pause
        vis.segments.push(segment);
        vis.highlighted_segment = segment;
        await vis.draw_and_pause();
    }

    // mark the visualization as finished
    vis.highlighted_segment = null;
    vis.finished();
}
