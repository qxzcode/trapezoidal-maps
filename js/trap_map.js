class trapezoid {
    constructor(x_min,x_max,top_seg,bot_seg) {
        this.xmin = x_min;
        this.xmax = x_max;
        this.top = top_seg;
        this.bot = bot_seg;
    }

    equals(t1) {
        return (this.xmin == t1.xmin) && (this.xmax == t1.xmax) && (this.top.equals(t1.top)) && (this.bot.equals(t1.bot)); 
    }

    is_within(pt) {
        let res = false;
        res = (this.xmin <= pt.x) && (this.xmax > pt.x) && (this.top.compare(pt) <= 0) && (this.bot.compare(pt) > 0);
        return res;
    }
}

const nodeTypes = {
    X_NODE: "x_node",
    Y_NODE: "y_node",
    T_NODE: "t_node",
}

class node {
    constructor(d,f,type){
        this.parent = [];
        this.left = null;
        this.right = null;
        this.data = d;
        this.navigate = f;
        this.type = type;
    }

    equals(n) {
        return this.data.equals(n.data);
    }

    hasChildren(){
        return (this.left === null) && (this.right === null);
    }

    navigate(pt) {
        let left = true;
        switch(this.type){
            case nodeTypes.X_NODE:
                if(pt.x >= this.data.x) {
                    left = false;
                }
            case nodeTypes.Y_NODE:
                if(this.data.compare(pt) < 0){
                    left = false;
                }
            case nodeTypes.T_NODE:
                return null;
        }
        return left;
    }
}
  
class tree {
    constructor(r_node){
        root = r_node;
        x_count = 0;
        y_count = 0;
        t_count = 0;
    };

    insertNode(in_node){

    }  
  
    insertSeg(segment, tmap) {
        // what happens when one of our segment points shares a point with one already in the map?
        // 

        // takes in a segment and a trapezoidal map
        // inserts the segment into the map
        trapsList = this.findTrapsCrossed(segment,tmap)
        // for each trapezoid, we can assume that the segment passes through it, so we only need to check endpoints
        trapsList.forEach(t => {
            p = t.parent
            // find trapezoid in children list, remove it
            let isLeft = (t.equals(p.left));
            // determine our case
            let nroot = null;
            if(t.is_within(segment.p1) && t.is_within(segment.p2)) {
                // case 2
            }
            else if(t.is_within(segment.p1) || t.is_within(segment.p2)) {
                // case 1
            }
            else {
                // case 3 
            }
            if(isLeft) {
                p.left = nroot;
            }
            else {
                p.right = nroot;
            }
        });
    }
  
    findTrapsCrossed(segment,tmap) {
        // takes in a segment and trapezoidal map
        // traverses the map to find each trapezoid crossed by the segment
        // it may be best or tlist to be a sort of dictionary with the trapezoid and the point used to select it from the x_node
        tlist = [];
        x_nodes_to_check = [];
        // traverse to L endpoint
        currentNode = tmap.root;
        last_point = null;
        while(currentNode.hasChildren()) {
            if (currentNode.type == nodeTypes.X_NODE) {
                let nav1 = currentNode.navigate(segment.p1);
                let nav2 = currentNode.navigate(segment.p2);
                if(nav1 == null || nav2 == null) {
                    console.log("ILLEGAL NAVIGATION");
                    return;
                }
                if(nav1 != nav2) {
                    x_nodes_to_check.push(new point(currentNode.point.x,segment.getYpos(currentNode.point.x)));
                }
                last_point = currentNode.point
            }
            let n = currentNode.navigate(segment.p1);
            if(n) {
                currentNode = currentNode.left;
            }
            else {
                currentNode = currentNode.right;
            }
        }
        tlist.append(currentNode,last_point);
        // traverse to R endpoint
        currentNode = tmap.root;
        while(currentNode.hasChildren()) {
            if (currentNode.type == nodeTypes.X_NODE) {
                let nav1 = currentNode.navigate(segment.p1);
                let nav2 = currentNode.navigate(segment.p2);
                if(nav1 == null || nav2 == null) {
                    console.log("ILLEGAL NAVIGATION");
                    return;
                }
                if(nav1 != nav2 && x_nodes_to_check.findIndex(currentNode,(element) => element.equals(currentNode)) == -1) {
                    x_nodes_to_check.push(new point(currentNode.point.x,segment.getYpos(currentNode.point.x)))
                }
                last_point = currentNode.point
            }
            let n = currentNode.navigate(segment.p2);
            if(n) {
                currentNode = currentNode.left;
            }
            else {
                currentNode = currentNode.right;
            }
        }
        tlist.push(currentNode, last_point);
        // sort the list of new points by x value
        // x_nodes_to_check.sort()
        // traverse the list of new points, adding points to the list if they need to be explored
        // perhaps change the x_nodes_to_check to a priority queue? Then this would be a while loop, rather than a for loop, but otherwise be the same
        while(x_nodes_to_check.length > 0) {
            const point = x_nodes_to_check.shift();
            currentNode = tmap.root;
            while (currentNode.hasChildren()){
                if (currentNode.type == nodeTypes.X_NODE ){
                    let nav1 = currentNode.navigate(segment.p1);
                    let nav2 = currentNode.navigate(segment.p2);
                    if(nav1 == null || nav2 == null) {
                        console.log("ILLEGAL NAVIGATION");
                        return;
                    }
                    if(nav1 != nav2 && x_nodes_to_check.findIndex(currentNode,(element) => element.equals(currentNode)) == -1) {
                        x_nodes_to_check.push(new point(currentNode.point.x,segment.getYpos(currentNode.point.x)))
                    }
                    last_point = currentNode.point
                }
                let n = currentNode.navigate(point);
                if(n) {
                    currentNode = currentNode.left;
                }
                else {
                    currentNode = currentNode.right;
                }
            }
            tlist.push(currentNode, last_point);
        }
        return tlist;
    }
}