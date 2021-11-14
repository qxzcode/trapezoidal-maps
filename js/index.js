//@ts-check
import { Point, Segment, Trapezoid, TrapezoidalMap, Node, Tree } from './trap_map.js';

class Visualization {
    /**
     * @param {{ x_min: number; y_min: number; x_max: number; y_max: number; }} data
     */
    constructor(data) {
        this.data = data;
        this._unpause_resolvers = [];
        this.scale = 6;

        // objects and state to be visualized
        /** @type Segment[] */
        this.segments = [];
        /** @type Segment= */
        this.highlighted_segment = null;
        /** @type TrapezoidalMap= */
        this.trap_map = null;
    }

    draw() {
        // setup the canvas transform
        // TODO: have this adapt to the data and canvas size
        ctx.resetTransform();
        ctx.translate(0, canvas.height);
        ctx.scale(this.scale, -this.scale);

        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw the bounding box
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / this.scale;
        ctx.strokeRect(this.data.x_min, this.data.y_min, this.data.x_max - this.data.x_min, this.data.y_max - this.data.y_min);

        // draw the trapezoidal map
        if (this.trap_map !== null) {
            const tree = this.trap_map.root;
            const traps = this._get_trapezoids(tree.root);
            console.log("Drawing", traps.size, "trapezoids")
            ctx.save();
            for (const trap of traps) {
                this._draw_trapezoid(trap);
            }
            ctx.restore();
        }

        // draw the segments
        ctx.lineCap = 'round';
        ctx.lineWidth = 5 / this.scale;
        for (const segment of this.segments) {
            const color = this.highlighted_segment === segment ? 'blue' : 'gray';
            segment.draw(ctx, color);
        }
    }

    /**
     * Draws a trapezoid.
     * @param {Trapezoid} trap
     */
    _draw_trapezoid(trap) {
        //ctx.fillStyle = trap.color;
        ctx.fillStyle = 'hsla(0, 100%, 50%, 0.1)';
        ctx.strokeStyle = 'black';
        ctx.setLineDash([5 / this.scale, 5 / this.scale]);

        ctx.beginPath();
        ctx.moveTo(trap.xmin, trap.top.getYpos(trap.xmin));
        ctx.lineTo(trap.xmax, trap.top.getYpos(trap.xmax));
        ctx.lineTo(trap.xmax, trap.bot.getYpos(trap.xmax));
        ctx.stroke();
        ctx.lineTo(trap.xmin, trap.bot.getYpos(trap.xmin));
        ctx.fill();
    }

    /**
     * Gets all trapezoid leaves under the given `Node` (recursively).
     * @param {Node} node
     * @param {Set<Trapezoid>} traps
     */
    _get_trapezoids(node, traps = null) {
        traps = traps || new Set();
        if (node !== null) {
            if (node.type === 't_node') {
                /** @type Trapezoid */
                const trap = node.data;
                traps.add(trap);
            } else {
                this._get_trapezoids(node.left, traps);
                this._get_trapezoids(node.right, traps);
            }
        }
        return traps;
    }

    start() {
        // set up the step_button event handler that unpauses the visualization
        this.step_handler = () => {
            this._unpause_resolvers.forEach(resolve => resolve());
            this._unpause_resolvers = [];
        };
        step_button.addEventListener('click', this.step_handler);
    }

    async draw_and_pause() {
        this.draw();
        return new Promise(resolve => this._unpause_resolvers.push(resolve));
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
// @ts-ignore
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

/** @type HTMLButtonElement */
// @ts-ignore
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


/**
 * @param {Visualization} vis
 * @param {Segment[]} segments
 */
async function algorithm(vis, segments) {
    const data = INPUT_FILES['qt2393'];
    let trapMap = new TrapezoidalMap(new Point(data.x_min, data.y_min), new Point(data.x_max, data.y_max));
    vis.trap_map = trapMap;

    for (const segment of segments) {
        // do some algorithm work, e.g. add the segment to the trapezoidal map
        //...
        trapMap.insert(segment);

        console.log("t_count:", trapMap.root.t_count);

        // update the visualization and pause
        vis.segments.push(segment);
        vis.highlighted_segment = segment;
        await vis.draw_and_pause();
    }

    // mark the visualization as finished
    vis.highlighted_segment = null;
    vis.finished();
}
