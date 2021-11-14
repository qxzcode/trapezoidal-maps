//@ts-check
import { Point, Segment, Trapezoid, TrapezoidalMap, Node, Tree } from './trap_map.js';

class Visualization {
    /**
     * @param {{ x_min: number; y_min: number; x_max: number; y_max: number; }} data
     */
    constructor(data) {
        this.data = data;
        /** @type Segment[] */
        this.segments = [];
        /** @type Segment= */
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
            segment.draw(ctx, color);
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

    for (const segment of segments) {
        // do some algorithm work, e.g. add the segment to the trapezoidal map
        //...
        trapMap.insert(segment);

        console.log(trapMap.root.t_count);

        // update the visualization and pause
        vis.segments.push(segment);
        vis.highlighted_segment = segment;
        await vis.draw_and_pause();
    }

    // mark the visualization as finished
    vis.highlighted_segment = null;
    vis.finished();
}
