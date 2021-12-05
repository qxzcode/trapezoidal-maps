//@ts-check
import { Point, Segment, Trapezoid, TrapezoidalMap, Node, Tree } from './trap_map.js';

class Visualization {
    /**
     * @param {{ x_min: number; y_min: number; x_max: number; y_max: number; }} data
     */
    constructor(data) {
        this.data = data;
        this._unpause_resolvers = [];
        this.x_offset = 0 - data.x_min;
        this.y_offset = 0 - data.y_min;
        this.width = data.x_max - data.x_min;
        this.height = data.y_max - data.y_min;
        this.scale = canvas.height / this.height;
        this.async = true;
        this.currentlyHighlighted = 0;

        // resize the canvas to fit the data aspect ratio
        const aspect = this.height / this.width;
        canvas.width = canvas.height / aspect;

        // objects and state to be visualized
        /** @type Segment[] */
        this.segments = [];
        /** @type Segment= */
        this.highlighted_segment = null;

        /** @type TrapezoidalMap= */
        this.trap_map = null;
        /** @type Trapezoid= */
        this.highlighted_trap = null;
        /** @type Point= */
        this.query_point = null;
    }

    draw() {
        // setup the canvas transform
        // TODO: have this adapt to the data and canvas size
        ctx.resetTransform();
        ctx.translate(0, canvas.height);
        ctx.scale(this.scale, -this.scale);

        // clear the canvas
        ctx.clearRect(0, 0, this.width, this.height);

        // draw the bounding box
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2 / this.scale;
        ctx.strokeRect(
            (this.data.x_min + this.x_offset), (this.data.y_min + this.y_offset),
            (this.data.x_max + this.x_offset), (this.data.y_max + this.y_offset)
        );

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
            const color = this.highlighted_segment === segment ? 'Chartreuse' : 'CadetBlue';
            segment.draw(ctx, color, this.x_offset, this.y_offset);
        }

        // draw the query point
        if (this.query_point !== null) {
            ctx.fillStyle = "#ff2626";
            ctx.beginPath();
            ctx.arc(this.query_point.x + this.x_offset, this.query_point.y + this.y_offset, 0.008 * this.height, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 
     * @param {number} lineNum 
     */
    highlight_line(lineNum) {
        pseudoCodeBlock.children[this.currentlyHighlighted].className = "";
        pseudoCodeBlock.children[lineNum].className = "highlighted";
        this.currentlyHighlighted = lineNum;
    }

    /**
     * Draws a trapezoid.
     * @param {Trapezoid} trap
     */
    _draw_trapezoid(trap) {
        //ctx.fillStyle = trap.color;
        if (trap === this.highlighted_trap) {
            ctx.fillStyle = 'hsla(0, 100%, 50%, 0.25)';
        } else {
            ctx.fillStyle = 'hsla(0, 100%, 50%, 0.1)';
        }
        ctx.strokeStyle = 'black';
        ctx.setLineDash([5 / this.scale, 5 / this.scale]);

        ctx.beginPath();
        ctx.moveTo(trap.xmin + this.x_offset, trap.top.getYpos(trap.xmin) + this.y_offset);
        ctx.lineTo(trap.xmax + this.x_offset, trap.top.getYpos(trap.xmax) + this.y_offset);
        ctx.lineTo(trap.xmax + this.x_offset, trap.bot.getYpos(trap.xmax) + this.y_offset);
        ctx.stroke();
        ctx.lineTo(trap.xmin + this.x_offset, trap.bot.getYpos(trap.xmin) + this.y_offset);
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
        this.continuer = () => {
            this.step_handler();
            this.async = false;
        }
        step_button.addEventListener('click', this.step_handler);
        finish_button.addEventListener('click', this.continuer);
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
        finish_button.removeEventListener('click', this.continuer);
        finish_button.style.display = "none";
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** @type Object */
const PATH_LIST = {
    Simple1: 'InputFiles/ac7717.txt',
    Simple2: 'InputFiles/qt2393.txt',
    Simple3: 'InputFiles/axb1107.txt',
    Simple4: 'InputFiles/ahk1190.txt',
    Germany: 'InputFiles/DEU_adm1_reproj_simp1.txt',
};

// /** @type HTMLSelectElement */
// // @ts-ignore
// const inputList = document.getElementById('inputs');
// for (const key in INPUT_FILES) {
//     let opt = document.createElement("option");
//     opt.value = key;
//     opt.innerHTML = key;
//     inputList.appendChild(opt);
// }

// $.getHTML('./InputFiles').done((json) => {
//     console.log(json); //["doc1.jpg", "doc2.jpg", "doc3.jpg"] 
// }).fail((jqxhr, textStatus, error) => {
//     var err = textStatus + ", " + error;
//     console.log("Request Failed: " + err);
// });

/** @type HTMLSelectElement */
// @ts-ignore
const fileList = document.getElementById('fileInputs');
for (const key in PATH_LIST) {
    let opt = document.createElement("option");
    opt.value = PATH_LIST[key];
    opt.innerHTML = key;
    fileList.appendChild(opt);
}


/** @type HTMLCanvasElement */
// @ts-ignore
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

/** @type HTMLButtonElement */
// @ts-ignore
const step_button = document.getElementById('step_button');
/** @type HTMLButtonElement */
// @ts-ignore
const finish_button = document.getElementById('finish_button');
finish_button.style.display = "none";
let id_str = 'qt2393';
let loadedFromFile = false;
let data = INPUT_FILES['qt2393'];

const pseudoCodeBlock = document.getElementById('pseudocode');


/** @type {HTMLInputElement} */
// @ts-ignore
const stepSpeedInput = document.getElementById('step_speed');
function getStepDelay() {
    // step delays are in milliseconds
    const MAX_DELAY = 1000;
    const MIN_DELAY = 15;

    const sliderValue = parseFloat(stepSpeedInput.value);
    const delayFactor = (100 - sliderValue) / 100;
    if (delayFactor <= 0) {
        return 0;  // no delay (don't even draw or sleep)
    } else {
        // lerp in log space to get a logarithmic slider
        const logDelay = delayFactor * Math.log(MAX_DELAY) + (1 - delayFactor) * Math.log(MIN_DELAY);
        return Math.exp(logDelay);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    canvas.height = 600;

    // const segments = data.segments.map(s =>
    //     new Segment(new Point(s.x1, s.y1), new Point(s.x2, s.y2)));
    let visualization = new Visualization(data);
    visualization.draw();

    function start() {
        step_button.removeEventListener('click', start);
        step_button.textContent = 'Step';
        visualization.start();
        finish_button.style.display = "";
        // algorithm(visualization, segments);
        algorithm(visualization);
    }
    step_button.addEventListener('click', start);
    // loadButton.addEventListener('click', () => {
    //     id_str = inputList.value;
    //     loadedFromFile = false;
    // })
    fileList.addEventListener('change', function () {
        visualization = null;
        step_button.disabled = true;
        step_button.removeEventListener('click', start);
        loadFile(fileList.value).then(result => {
            data = result
            visualization = new Visualization(data);
            visualization.draw();
            loadedFromFile = true;
            step_button.disabled = false;
            step_button.addEventListener('click', start);
            step_button.textContent = 'Start';
        });
    });
});

/** @type HTMLTableElement */
// @ts-ignore
const adjMat = document.getElementById('adjMat');

const queryButton = document.getElementById('queryButton');

let allText = '';


/**
 * @param {Visualization} vis
 */
//* @param {Segment[]} segments
// async function algorithm(vis, segments) {
async function algorithm(vis) {
    if (!loadedFromFile) {
        data = INPUT_FILES[id_str];
    }
    let segments = data.segments.map(s =>
        new Segment(new Point(s.x1, s.y1), new Point(s.x2, s.y2)));
    let trapMap = new TrapezoidalMap(new Point(data.x_min, data.y_min), new Point(data.x_max, data.y_max), vis);
    vis.trap_map = trapMap;

    let queryDiv = document.getElementById('queryDiv');
    queryDiv.style.visibility = 'visible';
    queryButton.addEventListener('click', (event) => { pointFromText(vis, trapMap) });

    // randomize the segment order:
    segments.sort(() => Math.random() - 0.5);

    for (const segment of segments) {
        // do some algorithm work, e.g. add the segment to the trapezoidal map
        //...
        trapMap.insert(segment);

        console.log("x_count: ", trapMap.root.x_count);
        console.log("y_count: ", trapMap.root.y_count);
        console.log("t_count: ", trapMap.root.t_count);

        console.log("n_traps in set: ", trapMap.root.trap_set.size);
        console.log("n_segs in set: ", trapMap.root.seg_set.size);
        console.log("n_points in set: ", trapMap.root.point_set.size);

        // update the visualization and pause
        vis.segments.push(segment);
        vis.highlighted_segment = segment;
        if (vis.async) {
            await vis.draw_and_pause();
        } else {
            const delayMillis = getStepDelay();
            if (delayMillis > 0) {
                vis.draw();
                await sleep(delayMillis);
            }
        }
    }
    vis.draw()

    if (segments.length < 30) {
        let titleRow = adjMat.insertRow();
        titleRow.insertCell().innerHTML = '    ';
        const trapArray = Array.from(trapMap.root.trap_set);
        const segArray = Array.from(trapMap.root.seg_set);
        const pointArray = Array.from(trapMap.root.point_set);
        let nThings = trapArray.length + segArray.length + pointArray.length;
        let adjTable = trapMap.root.genTable();
        let nP = 0;
        let nQ = 0;
        for (let index = 0; index < pointArray.length; index++) {
            const pt = pointArray[index];
            if (pt.label == 'P') {
                titleRow.insertCell().innerHTML = pt.label + nP;
                nP++;
            } else {
                titleRow.insertCell().innerHTML = pt.label + nQ;
                nQ++;
            }
        }
        for (let index = 0; index < segArray.length; index++) {
            const seg = segArray[index];
            titleRow.insertCell().innerHTML = 'S' + index;
        }
        for (let index = 0; index < trapArray.length; index++) {
            const trap = trapMap[index];
            titleRow.insertCell().innerHTML = 'T' + index;
        }
        nP = 0;
        nQ = 0;
        for (let index = 0; index < pointArray.length; index++) {
            const pt = pointArray[index];
            let nRow = adjMat.insertRow();
            if (pt.label == 'P') {
                nRow.insertCell().innerHTML = pt.label + nP;
                nP++;
            } else {
                nRow.insertCell().innerHTML = pt.label + nQ;
                nQ++;
            }
            for (let ind2 = 0; ind2 < nThings; ind2++) {
                nRow.insertCell();
            }
        }
        for (let index = 0; index < segArray.length; index++) {
            const seg = segArray[index];
            let nRow = adjMat.insertRow();
            nRow.insertCell().innerHTML = 'S' + index;
            for (let ind2 = 0; ind2 < nThings; ind2++) {
                nRow.insertCell();
            }
        }
        for (let index = 0; index < trapArray.length; index++) {
            const trap = trapMap[index];
            let nRow = adjMat.insertRow();
            nRow.insertCell().innerHTML = 'T' + index;
            for (let ind2 = 0; ind2 < nThings; ind2++) {
                nRow.insertCell();
            }
        }

        for (let i = 0; i < adjTable.length; i++) {
            for (let j = 0; j < adjTable[i].length; j++) {
                adjMat.rows[i + 1].cells[j + 1].innerHTML = String(adjTable[i][j]);
                if (adjTable[i][j] > 0) {
                    adjMat.rows[i + 1].cells[j + 1].style.backgroundColor = "LightCoral";
                }
            }
        }
    }
    // mark the visualization as finished
    vis.highlighted_segment = null;
    vis.finished();

    await doPointPicking(vis, trapMap);
}

/**
 * @param {Visualization} vis
 * @param {TrapezoidalMap} trapMap
 */
async function doPointPicking(vis, trapMap) {
    canvas.addEventListener('click', event => {
        if (event.button === 0) {
            let x = event.offsetX / vis.scale;
            let y = (canvas.height - event.offsetY) / vis.scale;
            doQueryAndDraw(vis, trapMap, x - vis.x_offset, y - vis.y_offset);
        }
    });
}

/**
 * @param {Visualization} vis
 * @param {TrapezoidalMap} trapMap
 */
function pointFromText(vis, trapMap) {
    /** @type HTMLInputElement */
    // @ts-ignore
    let xIn = document.getElementById('xval');
    /** @type HTMLInputElement */
    // @ts-ignore
    let yIn = document.getElementById('yval');
    doQueryAndDraw(vis, trapMap, parseFloat(xIn.value), parseFloat(yIn.value));
}

/**
 * @param {Visualization} vis
 * @param {TrapezoidalMap} trapMap
 * @param {number} x - query x coordinate, in data coordinates
 * @param {number} y - query y coordinate, in data coordinates
 */
function doQueryAndDraw(vis, trapMap, x, y) {
    vis.query_point = new Point(x, y);
    const trapNList = trapMap.query(x, y);
    vis.highlighted_trap = trapNList[0];
    console.log(trapNList[1])
    vis.draw();
}

/**
 * @param {String} fileName
 */
async function loadFile(fileName) {
    // var file = '../InputFiles/tdl1818.txt';
    var rawFile = new XMLHttpRequest();
    var allText = 'ERROR';
    let data = {};

    const utf8Decoder = new TextDecoder('utf-8');
    let response = await fetch(fileName);
    const reader = response.body.getReader();
    let { value: chunk, done: readerDone } = await reader.read();
    allText = chunk ? utf8Decoder.decode(chunk) : '';

    const lines = allText.split('\n');

    let nlines = parseInt(lines[0]);

    let bbox = lines[1].split(' ');
    data.x_min = parseFloat(bbox[0]);
    data.y_min = parseFloat(bbox[1]);
    data.x_max = parseFloat(bbox[2]);
    data.y_max = parseFloat(bbox[3]);

    /** @type {{ x1: number; y1: number; x2: number; y2: number; }[]} */
    data.segments = [];

    for (let index = 2; index < lines.length; index++) {
        const element = lines[index];
        let vals = element.split(' ');
        if (vals.length > 3) {
            data.segments.push({ x1: parseFloat(vals[0]), y1: parseFloat(vals[1]), x2: parseFloat(vals[2]), y2: parseFloat(vals[3]) });
        } else {
            console.log('Reading a line without enough values for a segment');
        }
    }

    return data;
}
