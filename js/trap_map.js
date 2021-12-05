//@ts-check
import { Visualization } from './index.js';

class Point {
    /**
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Point} pt the `Point` to compare to
     */
    equals(pt) {
        return (this.x === pt.x) && (this.y === pt.y);
    }

    to_string() {
        return 'x' + this.x + 'y' + this.y;
    }
}

class Segment {
    /**
     * @param {Point} p1 one endpoint of the segment
     * @param {Point} p2 the other endpoint of the segment
     */
    constructor(p1, p2) {
        if (p1.x < p2.x) {
            this.p1 = p1;
            this.p2 = p2;
        } else {
            this.p1 = p2;
            this.p2 = p1;
        }
        this.m = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        this.b = p1.y - this.m * p1.x;
    }

    to_string() {
        return 'p1' + this.p1.to_string() + 'p2' + this.p2.to_string();
    }

    /**
     * @param {Segment} seg the `Segment` to compare to
     */
    equals(seg) {
        return (this.p1.equals(seg.p1)) && (this.p2.equals(seg.p2));
    }

    /**
     * @param {number} xpos the x coordinate to query
     */
    getYpos(xpos) {
        return this.m * xpos + this.b;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx the canvas rendering context
     * @param {string} color the drawn segment color (a CSS color string)
     */
    draw(ctx, color, offset_x, offset_y) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.p1.x + offset_x, this.p1.y + offset_y);
        ctx.lineTo(this.p2.x + offset_x, this.p2.y + offset_y);
        ctx.stroke();
    }

    /**
     * @param {Point} pt
     */
    compare(pt) {
        let ypos = this.getYpos(pt.x);
        if (pt.y > ypos) {
            return 1;
        } else if (pt.y < ypos) {
            return -1;
        } else {
            return 0;
        }
    }
}

class PointInfo {
    /**
     * @param {Point} pt the point in question
     * @param {string} label which side it's on (P or Q)
     */
    constructor(pt, label) {
        this.pt = pt;
        this.label = label;
    }
}

class Trapezoid {
    /**
     * @param {number} x_min
     * @param {number} x_max
     * @param {Segment} top_seg
     * @param {Segment} bot_seg
     */
    constructor(x_min, x_max, top_seg, bot_seg) {
        this.xmin = x_min;
        this.xmax = x_max;
        this.top = top_seg;
        this.bot = bot_seg;
        this.color = `hsla(${Math.random() * 360}, 100%, 50%, 0.1)`;
    }

    segments_key() {
        return 'top' + this.top.to_string() + 'bot' + this.bot.to_string();
    }

    /**
     * @param {Trapezoid} t1 the `Trapezoid` to compare to
     */
    equals(t1) {
        return (this.xmin === t1.xmin) && (this.xmax === t1.xmax) && (this.top.equals(t1.top)) && (this.bot.equals(t1.bot));
    }

    /**
     * Tests whether a point is within this `Trapezoid`.
     * @param {Point} pt the point to test
     */
    is_within(pt) {
        let res = false;
        res = (this.xmin <= pt.x) && (this.xmax > pt.x) && (this.top.compare(pt) <= 0) && (this.bot.compare(pt) > 0);
        return res;
    }

    /**
     * Returns the trapezoid that the point is within (this).
     * @param {Point} _point
     */
    locate(_point) {
        return this;
    }
}

class XNode {
    /**
     * @param {Point} point
     * @param {XNode|YNode|Trapezoid} leftChild
     * @param {XNode|YNode|Trapezoid} rightChild
     */
    constructor(point, leftChild, rightChild) {
        this.point = point;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
    }

    /**
     * Returns the trapezoid that the point is within.
     * @param {Point} point
     */
    locate(point) {
        const child = (point.x < this.point.x) ? this.leftChild : this.rightChild;
        return child.locate(point);
    }
}

class YNode {
    /**
     * @param {Segment} segment
     * @param {XNode|YNode|Trapezoid} leftChild
     * @param {XNode|YNode|Trapezoid} rightChild
     */
    constructor(segment, leftChild, rightChild) {
        this.segment = segment;
        this.leftChild = leftChild;
        this.rightChild = rightChild;
    }

    /**
     * Returns the trapezoid that the point is within.
     * @param {Point} point
     */
    locate(point) {
        const child = (point.y < this.segment.getYpos(point.x)) ? this.leftChild : this.rightChild;
        return child.locate(point);
    }
}

class TrapezoidalMap {
    /**
     * @param {Point} min_pt
     * @param {Point} max_pt
     * @param {Visualization} visualization
     */
    constructor(min_pt, max_pt, visualization) {
        const seg1 = new Segment(new Point(min_pt.x, max_pt.y), max_pt);
        const seg2 = new Segment(min_pt, new Point(max_pt.x, min_pt.y));
        const t0 = new Trapezoid(min_pt.x, max_pt.x, seg1, seg2);
        const n = new Node(t0, null, nodeTypes.T_NODE);
        this.root = new Tree(n, visualization);
    }

    /**
     * Inserts a segment into the map.
     * @param {Segment} segment the segment to insert
     */
    async insert(segment) {
        // locate the trapezoid containing each endpoint of the segment
        // const left = this.root.locate(segment.left_pt);
        // const right = this.root.locate(segment.right_pt);
        await this.root.insertSeg(segment, this.root);
        //...
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {[Trapezoid, [string, Node][]]}
     */
    query(x, y) {
        let currentNode = this.root.root;
        const queryPoint = new Point(x, y);
        /** @type {[string, Node][]} */
        let queryList = [];

        while (currentNode.hasChildren()) {
            const dir = currentNode.navigate(queryPoint);
            const nodeName = this.root.getNodeName(currentNode);
            queryList.push([nodeName, currentNode]);
            console.log(nodeName);
            currentNode = dir ? currentNode.left : currentNode.right;
        }
        const nodeName = this.root.getNodeName(currentNode);
        queryList.push([nodeName, currentNode]);
        console.log(nodeName);
        return [currentNode.data, queryList];
    }
}



// a stand-in for an enum type
/** @type {{X_NODE: "x_node", Y_NODE: "y_node", T_NODE: "t_node"}} */
const nodeTypes = {
    X_NODE: "x_node",
    Y_NODE: "y_node",
    T_NODE: "t_node",
}

class Node {
    /**
     * @param {any} d
     * @param {(pt: Point) => boolean} f
     * @param {"x_node"|"y_node"|"t_node"} type
     */
    constructor(d, f, type) {
        /** @type Set<Node> */
        this.parent = new Set();
        /** @type Node= */
        this.left = null;
        /** @type Node= */
        this.right = null;
        this.data = d;
        this.navigate = f;
        this.type = type;
    }

    /**
     * @param {Node} n the `Node` to compare to
     */
    equals(n) {
        return this.data.equals(n.data);
    }

    hasChildren() {
        return this.left !== null && this.right !== null;
    }

    /**
     * @param {Point} pt
     */
    navigate(pt) {
        let left = true;
        switch (this.type) {
            case nodeTypes.X_NODE:
                if (pt.x >= this.data.x) {
                    left = false;
                }
            case nodeTypes.Y_NODE:
                if (this.data.compare(pt) < 0) {
                    left = false;
                }
            case nodeTypes.T_NODE:
                return null;
        }
        return left;
    }
}

class Tree {
    /**
     * @param {Node} r_node the initial root node
     * @param {Visualization} visualization the visualizer
     */
    constructor(r_node,visualization) {
        this.root = r_node;
        this.x_count = 0;
        this.y_count = 0;
        this.t_count = 1;
        /** @type Set<Segment> */
        this.seg_set = new Set();
        /** @type Set<PointInfo> */
        this.point_set = new Set();
        /** @type Set<Trapezoid> */
        this.trap_set = new Set();

        this.trap_set.add(r_node.data);
        this.vis = visualization;

        /** @type {{ [key: string]: Node[] }} */
        this.seg_dict = {};
        let sp = r_node.data.segments_key();
        this.seg_dict[sp] = [r_node];
    };

    insertNode(in_node) {

    }

    /**
     * @param {Segment} segment
     * @param {Tree} tmap
     */
    async insertSeg(segment, tmap) {
        // takes in a segment and a trapezoidal map
        // inserts the segment into the map
        if (this.seg_set.has(segment)) { return; }
        this.seg_set.add(segment);
        this.point_set.add(new PointInfo(segment.p1, 'P'))
        this.point_set.add(new PointInfo(segment.p2, 'Q'));
        await this.vis.highlight_line(2);
        let trapsList = this.findTrapsCrossed(segment, tmap)
        // for each trapezoid, we can assume that the segment passes through it, so we only need to check endpoints
        for(const t of trapsList){
            let p = Array.from(t.parent);
            this.trap_set.delete(t.data);
            // find trapezoid in children list, remove it
            let sp = t.data.segments_key();
            const relArray = this.seg_dict[sp];
            const index = relArray.indexOf(t);
            if (index > -1) {
                relArray.splice(index, 1);
            }
            this.seg_dict
            let isLeft = false;
            if (p.length > 0) {
                isLeft = t.equals(p[0].left);
            }
            // determine our case
            let nroot;
            this.t_count--;
            await this.vis.highlight_line(4);
            if (t.data.is_within(segment.p1) && t.data.is_within(segment.p2)) {
                // case 2
                await this.vis.highlight_line(7);
                nroot = this.replaceTrapCase2(t, segment);
            }
            else if (t.data.is_within(segment.p1) || t.data.is_within(segment.p2)) {
                await this.vis.highlight_line(14);
                // case 1
                const pt = t.data.is_within(segment.p1) ? segment.p1 : segment.p2;
                await this.vis.highlight_line(17);
                nroot = this.replaceTrapCase1(t, pt, segment);
            }
            else {
                await this.vis.highlight_line(25);
                // case 3
                nroot = this.replaceTrapCase3(t, segment);
            }
            await this.vis.highlight_line(33);
            if (!(p.length > 0)) {
                this.root = nroot;
            } else {
                p.forEach(parent => {
                    if (t.equals(parent.left)) {
                        parent.left = nroot;
                    } else {
                        parent.right = nroot;
                    }
                    nroot.parent.add(parent);
                });
            }
        }
    }

    /**
     * @param {Node} node
     */
    getNodeName(node) {
        const pointArray = Array.from(this.point_set);
        const segArray = Array.from(this.seg_set);
        const trapArray = Array.from(this.trap_set);
        let index = 0;
        let nodeName = 'T'
        if (node.type === nodeTypes.T_NODE) {
            index = trapArray.findIndex((element) => element.equals(node.data));
            nodeName = 'T' + index;
        } else if (node.type === nodeTypes.Y_NODE) {
            index = segArray.findIndex((element) => element.equals(node.data));
            nodeName = 'S' + index;
        } else {
            let compPointIndex = (element) => element.pt.equals(node.data);
            index = pointArray.findIndex(compPointIndex);
            let indNum = Math.floor(index / 2);
            nodeName = pointArray[index].label + indNum;
        }
        return nodeName;
    }

    genTable() {
        const pointArray = Array.from(this.point_set);
        const segArray = Array.from(this.seg_set);
        const trapArray = Array.from(this.trap_set);
        const nThings = pointArray.length + segArray.length + trapArray.length;
        /** @type number[][] */
        let adjTable = new Array(nThings).fill(null).map(() => new Array(nThings).fill(0));

        /** @param {Node} node */
        function getIndex(node) {
            let index;
            if (node.type === nodeTypes.T_NODE) {
                // find index of trapezoid
                index = trapArray.findIndex(trap => trap.equals(node.data));
                if (index < 0) throw "ERROR FINDING TRAPEZOIDS";
                index += pointArray.length + segArray.length;
            } else if (node.type === nodeTypes.Y_NODE) {
                // find index of segment
                index = segArray.findIndex(seg => seg.equals(node.data));
                if (index < 0) throw "ERROR FINDING SEGMENTS";
                index += pointArray.length;
            } else { // X_NODE
                // find index in PointInfo list
                index = pointArray.findIndex(pinfo => pinfo.pt.equals(node.data));
                if (index < 0) throw "ERROR FINDING POINTS";
            }
            return index;
        }

        let nodesToTraverse = [this.root];
        while (nodesToTraverse.length > 0) {
            // get the next node and queue its children
            const currentNode = nodesToTraverse.pop();
            if (currentNode.hasChildren()) {
                nodesToTraverse.push(currentNode.left);
                nodesToTraverse.push(currentNode.right);
            }

            // mark the current node's parents
            const childIndex = getIndex(currentNode);
            currentNode.parent.forEach(parent => {
                const parentIndex = getIndex(parent);
                adjTable[childIndex][parentIndex] = 1;
            });
        }

        return adjTable;
    }

    /**
     * @param {Node} trapNode
     */
    checkForMerge(trapNode) {
        let searchObj = trapNode.data.segments_key();
        if (this.seg_dict.hasOwnProperty(searchObj)) {
            const curTraps = this.seg_dict[searchObj];
            const adjTraps = curTraps.filter((val) => (val.data.xmin == trapNode.data.xmax || val.data.xmax == trapNode.data.xmin));
            if (adjTraps.length < 1) {
                // no adjacent trapezoids to merge
                // this.seg_dict[searchObj].push(trapNode);
                return trapNode;
            } else {
                const remTraps = curTraps.filter(val => (val.data.xmin != trapNode.data.xmax && val.data.xmax != trapNode.data.xmin));
                this.t_count -= adjTraps.length;
                this.seg_dict[searchObj] = remTraps;
                let xmin = trapNode.data.xmin;
                let xmax = trapNode.data.xmax;
                for (let index = 0; index < adjTraps.length; index++) {
                    const zoid = adjTraps[index];
                    this.trap_set.delete(zoid.data);
                    if (zoid.data.xmin < xmin) xmin = zoid.data.xmin;
                    if (zoid.data.xmax > xmax) xmax = zoid.data.xmax;
                }
                let newTrap = new Trapezoid(xmin, xmax, trapNode.data.top, trapNode.data.bot);
                let newTrapNode = new Node(newTrap, null, nodeTypes.T_NODE);
                adjTraps.forEach(zoid => {
                    const zparents = zoid.parent;
                    zparents.forEach(p => {
                        if (p.left === zoid) {
                            p.left = newTrapNode;
                        } else {
                            p.right = newTrapNode;
                        }
                        newTrapNode.parent.add(p);
                    })
                });
                return newTrapNode;
            }
        }
        else {
            this.seg_dict[searchObj] = [];
            return trapNode;
        }
    }

    /**
     * One point in trapezoid
     * @param {Node} trapNode
     * @param {Point} pt
     * @param {Segment} seg
     */
    replaceTrapCase1(trapNode, pt, seg) {
        /** @type Trapezoid */
        const trap = trapNode.data;
        let nodeFunc;
        let t1;
        if (pt.equals(seg.p1)) {
            nodeFunc = (in_pt) => { return pt.x >= in_pt.x };
            t1 = new Trapezoid(trap.xmin, pt.x, trap.top, trap.bot);
        }
        else {
            nodeFunc = (in_pt) => { return pt.x >= in_pt.x };
            t1 = new Trapezoid(pt.x, trap.xmax, trap.top, trap.bot);
        }
        let p = new Node(pt, nodeFunc, nodeTypes.X_NODE);
        let tNode = new Node(t1, null, nodeTypes.T_NODE);
        tNode = this.checkForMerge(tNode);
        let searchObj = tNode.data.segments_key();
        this.seg_dict[searchObj].push(tNode);
        this.trap_set.add(tNode.data);

        let t_above;
        let t_below;
        if (pt.equals(seg.p1)) {
            p.left = tNode;
            t_above = new Trapezoid(pt.x, trap.xmax, trap.top, seg);
            t_below = new Trapezoid(pt.x, trap.xmax, seg, trap.bot);
        }
        else {
            p.right = tNode;
            t_above = new Trapezoid(trap.xmin, pt.x, trap.top, seg);
            t_below = new Trapezoid(trap.xmin, pt.x, seg, trap.bot);
        }

        tNode.parent.add(p);

        let s = new Node(seg, (in_pt) => { return seg.compare(in_pt) > 0 }, nodeTypes.Y_NODE);

        let tNode2 = new Node(t_above, null, nodeTypes.T_NODE);
        tNode2 = this.checkForMerge(tNode2);
        searchObj = tNode2.data.segments_key();
        this.seg_dict[searchObj].push(tNode2);
        this.trap_set.add(tNode2.data);

        let tNode3 = new Node(t_below, null, nodeTypes.T_NODE);
        tNode3 = this.checkForMerge(tNode3);
        searchObj = tNode3.data.segments_key();
        this.seg_dict[searchObj].push(tNode3);
        this.trap_set.add(tNode3.data);

        s.left = tNode2;
        s.right = tNode3;
        tNode2.parent.add(s);
        tNode3.parent.add(s);
        if (pt.equals(seg.p1)) {
            p.right = s;
        } else {
            p.left = s;
        }
        s.parent.add(p);
        this.t_count += 3;
        this.x_count++;
        this.y_count++;
        return p;
    }

    /**
     * Both points in trapezoid
     * @param {Node} trapNode
     * @param {Segment} seg
     */
    replaceTrapCase2(trapNode, seg) {
        /** @type Trapezoid */
        const trap = trapNode.data;
        let nodeFunc = (in_pt) => { return seg.p1.x >= in_pt.x };
        let t1 = new Trapezoid(trap.xmin, seg.p1.x, trap.top, trap.bot);
        let nodeFunc2 = (in_pt) => { return seg.p2.x >= in_pt.x };
        let t2 = new Trapezoid(seg.p2.x, trap.xmax, trap.top, trap.bot);

        let tNode = new Node(t1, null, nodeTypes.T_NODE);
        tNode = this.checkForMerge(tNode);
        let searchObj = tNode.data.segments_key();
        this.seg_dict[searchObj].push(tNode);
        this.trap_set.add(tNode.data);

        let tNode2 = new Node(t2, null, nodeTypes.T_NODE)
        tNode2 = this.checkForMerge(tNode2);
        searchObj = tNode2.data.segments_key();
        this.seg_dict[searchObj].push(tNode2);
        this.trap_set.add(tNode2.data);

        let p = new Node(seg.p1, nodeFunc, nodeTypes.X_NODE);
        let q = new Node(seg.p2, nodeFunc2, nodeTypes.X_NODE);

        p.right = q;
        q.parent.add(p);
        p.left = tNode;
        tNode.parent.add(p);
        q.right = tNode2;
        tNode2.parent.add(q);

        let t_above = new Trapezoid(seg.p1.x, seg.p2.x, trap.top, seg);
        let t_below = new Trapezoid(seg.p1.x, seg.p2.x, seg, trap.bot);

        let s = new Node(seg, (in_pt) => { return seg.compare(in_pt) > 0 }, nodeTypes.Y_NODE);
        let tNode3 = new Node(t_above, null, nodeTypes.T_NODE);
        tNode3 = this.checkForMerge(tNode3);
        searchObj = tNode3.data.segments_key();
        this.seg_dict[searchObj].push(tNode3);
        this.trap_set.add(tNode3.data);

        let tNode4 = new Node(t_below, null, nodeTypes.T_NODE);
        tNode4 = this.checkForMerge(tNode4);
        searchObj = tNode4.data.segments_key();
        this.seg_dict[searchObj].push(tNode4);
        this.trap_set.add(tNode4.data);

        s.left = tNode3;
        s.right = tNode4;
        tNode3.parent.add(s);
        tNode4.parent.add(s);
        q.left = s;
        s.parent.add(q);

        this.t_count += 4;
        this.x_count += 2;
        this.y_count++;
        return p;
    }

    /**
     * No points in trapezoid; segment just crosses
     * @param {Node} trapNode
     * @param {Segment} seg
     */
    replaceTrapCase3(trapNode, seg) {
        /** @type Trapezoid */
        const trap = trapNode.data;
        let t_above = new Trapezoid(trap.xmin, trap.xmax, trap.top, seg);
        let t_below = new Trapezoid(trap.xmin, trap.xmax, seg, trap.bot);

        let s = new Node(seg, (in_pt) => { return seg.compare(in_pt) > 0 }, nodeTypes.Y_NODE);
        let tNode2 = new Node(t_above, null, nodeTypes.T_NODE);
        tNode2 = this.checkForMerge(tNode2);
        let searchObj = tNode2.data.segments_key();
        this.seg_dict[searchObj].push(tNode2);
        this.trap_set.add(tNode2.data);

        let tNode3 = new Node(t_below, null, nodeTypes.T_NODE);
        tNode3 = this.checkForMerge(tNode3);
        searchObj = tNode3.data.segments_key();
        this.seg_dict[searchObj].push(tNode3);
        this.trap_set.add(tNode3.data);

        s.left = tNode2;
        s.right = tNode3;
        tNode2.parent.add(s);
        tNode3.parent.add(s);

        this.y_count++;
        this.t_count += 2;

        return s;
    }

    /**
     * Takes in a segment and trapezoidal map.
     * Traverses the map to find each trapezoid crossed by the segment.
     * @param {Segment} segment
     * @param {Tree} tmap
     */
    findTrapsCrossed(segment, tmap) {
        // it may be best for tlist to be a sort of dictionary with the trapezoid and the point used to select it from the x_node
        /** @type Set<Node> */
        let tlist = new Set();
        /** @type Set<Node> */
        let x_nodes_to_check = new Set();
        // traverse to L endpoint
        let currentNode = this.root;
        let navPt1 = new Point(segment.p1.x, segment.p1.y);
        let navPt2 = new Point(segment.p2.x, segment.p2.y);
        // let last_point = null;
        while (currentNode.hasChildren()) {
            if (currentNode.type == nodeTypes.X_NODE) {
                // interpolate a bit up the line if we have a shared point
                if (currentNode.data.equals(segment.p1)) {
                    let t = 0.999;
                    // let t_pt = new Point(segment.p1.x, segment.p1.y);
                    navPt1.x = segment.p1.x * t + segment.p2.x * (1 - t);
                    navPt1.y = segment.getYpos(navPt1.x);
                    // segment.p1.x = t_pt.x;
                }
                const nav1 = currentNode.navigate(navPt1);
                const nav2 = currentNode.navigate(navPt2);
                if (nav1 == null || nav2 == null) {
                    console.log("ILLEGAL NAVIGATION");
                    return;
                }
                if (nav1 != nav2) {
                    x_nodes_to_check.add(currentNode);
                }
                // last_point = currentNode.point
            }
            const n = currentNode.navigate(navPt1);
            if (n) {
                currentNode = currentNode.left;
            }
            else {
                currentNode = currentNode.right;
            }
        }
        tlist.add(currentNode); //,last_point);
        // traverse to R endpoint
        currentNode = this.root;
        while (currentNode.hasChildren()) {
            if (currentNode.type == nodeTypes.X_NODE) {
                // interpolate a bit down the line if we have a shared point
                if (currentNode.data.equals(segment.p2)) {
                    let t = 0.999;
                    // let t_pt = new Point(segment.p2.x, segment.p2.y);
                    navPt2.x = segment.p1.x * (1 - t) + segment.p2.x * (t);
                    navPt2.y = segment.getYpos(navPt2.x);
                    // segment.p2.x = t_pt.x;
                }
                const nav1 = currentNode.navigate(navPt1);
                const nav2 = currentNode.navigate(navPt2);
                if (nav1 == null || nav2 == null) {
                    console.log("ILLEGAL NAVIGATION");
                    return;
                }
                if (nav1 != nav2) {
                    x_nodes_to_check.add(currentNode);
                }
                // last_point = currentNode.point
            }
            const n = currentNode.navigate(navPt2);
            if (n) {
                currentNode = currentNode.left;
            }
            else {
                currentNode = currentNode.right;
            }
        }
        tlist.add(currentNode) //, last_point);
        // sort the list of new points by x value
        // x_nodes_to_check.sort()
        // traverse the list of new points, adding points to the list if they need to be explored
        // perhaps change the x_nodes_to_check to a priority queue? Then this would be a while loop, rather than a for loop, but otherwise be the same
        let xNodesList = Array.from(x_nodes_to_check);
        while (xNodesList.length > 0) {
            const x_node = xNodesList.pop();
            x_nodes_to_check.delete(x_node);
            let search_point = new Point(x_node.data.x, segment.getYpos(x_node.data.x));
            currentNode = x_node;
            const n = currentNode.navigate(search_point);
            currentNode = n ? currentNode.left : currentNode.right;
            while (currentNode.hasChildren()) {
                if (currentNode.type == nodeTypes.X_NODE) {
                    const nav1 = currentNode.navigate(navPt1);
                    const nav2 = currentNode.navigate(navPt2);
                    if (nav1 == null || nav2 == null) {
                        console.log("ILLEGAL NAVIGATION");
                        return;
                    }
                    if (nav1 != nav2 && !x_nodes_to_check.has(currentNode)) {
                        x_nodes_to_check.add(currentNode);
                    }
                    // last_point = currentNode.point
                }
                const n = currentNode.navigate(search_point);
                if (n) {
                    currentNode = currentNode.left;
                }
                else {
                    currentNode = currentNode.right;
                }
            }
            xNodesList = Array.from(x_nodes_to_check);
            tlist.add(currentNode);//, last_point);
        }
        return tlist;
    }
}

export { Point, Segment, Trapezoid, TrapezoidalMap, Node, Tree, nodeTypes };