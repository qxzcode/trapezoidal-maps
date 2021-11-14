//@ts-check

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
    draw(ctx, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
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

class SegPair {
    constructor(seg1, seg2) {
        this.top = seg1;
        this.bot = seg2;
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
        this.color = `hsla(${Math.random()*360}, 100%, 50%, 0.1)`;
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
     */
    constructor(min_pt, max_pt) {
        const seg1 = new Segment(new Point(min_pt.x, max_pt.y), max_pt);
        const seg2 = new Segment(min_pt, new Point(max_pt.x, min_pt.y));
        const t0 = new Trapezoid(min_pt.x, max_pt.x, seg1, seg2);
        const n = new Node(t0, null, nodeTypes.T_NODE);
        this.root = new Tree(n);
    }

    /**
     * Inserts a segment into the map.
     * @param {Segment} segment the segment to insert
     */
    insert(segment) {
        // locate the trapezoid containing each endpoint of the segment
        // const left = this.root.locate(segment.left_pt);
        // const right = this.root.locate(segment.right_pt);
        this.root.insertSeg(segment, this.root);
        //...
    }
}



// a stand-in for an enum type
const nodeTypes = {
    X_NODE: "x_node",
    Y_NODE: "y_node",
    T_NODE: "t_node",
}

class Node {
    /**
     * @param {any} d
     * @param {(pt: Point) => boolean} f
     * @param {string} type
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
     */
    constructor(r_node) {
        this.root = r_node;
        this.x_count = 0;
        this.y_count = 0;
        this.t_count = 1;

        /** @type {{ [key: string]: Node[] }} */
        this.seg_dict = {};
        let sp = 'top' + r_node.data.top.to_string() + 'bot' + r_node.data.bot.to_string();
        this.seg_dict[sp] = [r_node];
    };

    insertNode(in_node) {

    }

    /**
     * @param {Segment} segment
     * @param {Tree} tmap
     */
    insertSeg(segment, tmap) {
        // takes in a segment and a trapezoidal map
        // inserts the segment into the map

        let trapsList = this.findTrapsCrossed(segment, tmap)
        // for each trapezoid, we can assume that the segment passes through it, so we only need to check endpoints
        trapsList.forEach(t => {
            let p = Array.from(t.parent);
            // find trapezoid in children list, remove it
            let sp = 'top' + t.data.top.to_string() + 'bot' + t.data.bot.to_string();
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
            if (t.data.is_within(segment.p1) && t.data.is_within(segment.p2)) {
                // case 2
                nroot = this.replaceTrapCase2(t, segment);
            }
            else if (t.data.is_within(segment.p1) || t.data.is_within(segment.p2)) {
                // case 1
                const pt = t.data.is_within(segment.p1) ? segment.p1 : segment.p2;
                nroot = this.replaceTrapCase1(t, pt, segment);
            }
            else {
                // case 3
                nroot = this.replaceTrapCase3(t, segment);
            }
            if (!(p.length > 0)) {
                this.root = nroot;
            } else {
                if (isLeft) {
                    p[0].left = nroot;
                }
                else {
                    p[0].right = nroot;
                }
                nroot.parent.add(p[0]);
            }
        });

        this.mergeTraps();
    }

    /**
     * @param {Node} trapNode
     */
    checkForMerge(trapNode) {
        let searchObj = 'top' + trapNode.data.top.to_string() + 'bot' + trapNode.data.bot.to_string();
        if (this.seg_dict.hasOwnProperty(searchObj)) {
            const curTraps = this.seg_dict[searchObj];
            const adjTraps = curTraps.filter((val) => (val.data.xmin == trapNode.data.xmax || val.data.xmax == trapNode.data.xmin));
            if (adjTraps.length < 1) {
                // no adjacent trapezoids to merge
                this.seg_dict[searchObj].push(trapNode);
                return trapNode;
            } else {
                const remTraps = curTraps.filter(val => (val.data.xmin != trapNode.data.xmax && val.data.xmax != trapNode.data.xmin));
                this.seg_dict[searchObj] = remTraps;
                let xmin = Number.MAX_VALUE;
                let xmax = Number.MIN_VALUE;
                for (let index = 0; index < adjTraps.length; index++) {
                    const zoid = adjTraps[index];
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
            this.seg_dict[searchObj] = [trapNode];
            return trapNode;
        }
    }

    /**
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
        let searchObj = 'top' + tNode.data.top.to_string() + 'bot' + tNode.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode);

        let t_above;
        let t_below;
        if (pt.equals(seg.p1)) {
            p.left = tNode;
            t_above = new Trapezoid(pt.x, trap.xmax, trap.top, seg);
            t_below = new Trapezoid(pt.x, trap.xmax, seg, trap.bot);
        }
        else {
            p.right = tNode;
            t_above = new Trapezoid(trap.xmax, pt.x, trap.top, seg);
            t_below = new Trapezoid(trap.xmax, pt.x, seg, trap.bot);
        }
        tNode.parent.add(p);
        let s = new Node(seg, (in_pt) => { return seg.compare(in_pt) > 0 }, nodeTypes.Y_NODE);
        let tNode2 = new Node(t_above, null, nodeTypes.T_NODE);
        let tNode3 = new Node(t_below, null, nodeTypes.T_NODE);
        tNode2 = this.checkForMerge(tNode2);
        searchObj = 'top' + tNode2.data.top.to_string() + 'bot' + tNode2.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode2);
        tNode3 = this.checkForMerge(tNode3);
        searchObj = 'top' + tNode3.data.top.to_string() + 'bot' + tNode3.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode3);
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
        let searchObj = 'top' + tNode.data.top.to_string() + 'bot' + tNode.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode);
        let tNode2 = new Node(t2, null, nodeTypes.T_NODE)
        tNode2 = this.checkForMerge(tNode2);
        searchObj = 'top' + tNode2.data.top.to_string() + 'bot' + tNode2.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode2);

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
        searchObj = 'top' + tNode3.data.top.to_string() + 'bot' + tNode3.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode3);
        let tNode4 = new Node(t_below, null, nodeTypes.T_NODE);
        tNode4 = this.checkForMerge(tNode4);
        searchObj = 'top' + tNode4.data.top.to_string() + 'bot' + tNode4.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode4);
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
        let searchObj = 'top' + tNode2.data.top.to_string() + 'bot' + tNode2.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode2);
        let tNode3 = new Node(t_below, null, nodeTypes.T_NODE);
        tNode3 = this.checkForMerge(tNode3);
        searchObj = 'top' + tNode3.data.top.to_string() + 'bot' + tNode3.data.bot.to_string();
        this.seg_dict[searchObj].push(tNode3);
        s.left = tNode2;
        s.right = tNode3;
        tNode2.parent.add(s);
        tNode3.parent.add(s);

        this.y_count++;
        this.t_count += 2;

        return s;
    }

    mergeTraps() {

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
        // let last_point = null;
        while (currentNode.hasChildren()) {
            if (currentNode.type == nodeTypes.X_NODE) {
                const nav1 = currentNode.navigate(segment.p1);
                const nav2 = currentNode.navigate(segment.p2);
                if (nav1 == null || nav2 == null) {
                    console.log("ILLEGAL NAVIGATION");
                    return;
                }
                if (nav1 != nav2) {
                    x_nodes_to_check.add(currentNode);
                }
                // last_point = currentNode.point
            }
            const n = currentNode.navigate(segment.p1);
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
                const nav1 = currentNode.navigate(segment.p1);
                const nav2 = currentNode.navigate(segment.p2);
                if (nav1 == null || nav2 == null) {
                    console.log("ILLEGAL NAVIGATION");
                    return;
                }
                if (nav1 != nav2 && x_nodes_to_check.has(currentNode)) {
                    x_nodes_to_check.add(currentNode);
                }
                // last_point = currentNode.point
            }
            const n = currentNode.navigate(segment.p2);
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
            currentNode = this.root;
            while (currentNode.hasChildren()) {
                if (currentNode.type == nodeTypes.X_NODE) {
                    const nav1 = currentNode.navigate(segment.p1);
                    const nav2 = currentNode.navigate(segment.p2);
                    if (nav1 == null || nav2 == null) {
                        console.log("ILLEGAL NAVIGATION");
                        return;
                    }
                    if (nav1 != nav2 && x_nodes_to_check.has(currentNode)) {
                        x_nodes_to_check.add(currentNode);
                    }
                    // last_point = currentNode.point
                }
                const n = currentNode.navigate(x_node.data);
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

export { Point, Segment, Trapezoid, TrapezoidalMap, Node, Tree };