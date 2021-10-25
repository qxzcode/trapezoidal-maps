# Trapezoidal Maps Data Structure Notes
------

Rules of General Position:
* No vertical segments
* No intersecting segments, except for shared endpoints

Properties of the trapezoid:
* 2 vertical segments
* 2 bounding segments
* Can be a triangle

Properties of the tree:
* Interior nodes:
  * Line segments
  * Endpoints
* Leaves:
  * trapezoids (with adjacency?)

Algorithm:
* Enclose all segments within large bounding rectangle
* bullet path from endpoints of segment to another segment or bounding rectangle

Given an initial map (can start with 1 trapezoid in bounding box)

Insert segment
* find left endpoint
* find right endpoint
* note any x-nodes between these (first node where p1 and p2 go different directions?)
* Find wall intersections
  * Any wall crossed needs to be trimmed (maybe not destroyed?)


Point-location structure:
* DAG with 3 types of nodes
  * Point nodes
  * Segment nodes
  * Leaf nodes
  * all nodes share these properties:
    * parents - a list of parent nodes, usually size 1
    * children - a list of children, either 2 or 0
    * data 
    * traverse function - a function pointer that indicates which child to trace
* Each node has zero or 2 outgoing edges
  * Nodes with zero outgoing are leaves/trapezoids
* 2 types of internal nodes:
  * x-nodes:
    * Contain point p (endpoint of a segment)
    * 2 children corresponding to regions L and R of bullet path
    * Navigating an x-node:
      * check the x-position
      * if x < p.x, left side of p
      * else right side of p
  * y-nodes:
    * Contain pointer to segment s
    * 2 children corresponding to regions above or below segment

Trapezoidal map
* Rep as a doubly connected edge list? (DCEL)
  * Where each trapezoid points to what's adjacent to its faces?
  * Each vertex knows what edge it belongs to, and what face it belongs to
  * Each face knows what edges comprise it and what vertices comprise it 

Initialize map
* Take the first segment, s1, and insert it into the map
* map becomes the graph:
* t1 <- p1 ->
  
           <- q1 -> t4

    t2 <- s1 -> t3

* with this method, do I really need a trapezoid or bullet path class?
  * we probably want a trapezoid class, but I think it only cares about its bounds?
  * The bounds of a trapezoid are the last point it's to the right of, and the last point it's to the left of. The top initially is the bounding box, as is the bottom, but on insertion the vertical bounds become defined by the bounds of the trapzoid being replaced, as well as the segment being inserted
  * given the x-bounds and the top and bottom segments, we can easily define the points of the trapezoid

Therefore, a trapezoid contains these details:
* Top segment
* Bottom segment
* min_x
* max_x

A new segment insertion determines the trapezoids being affected, and each trapezoid is replaced with a sub-tree based on the situation
* Case 1: 1 endpoint in trapezoid - creates 3 new trapezoids (5 new nodes)
* Case 2: 2 endpoints in trapezoid - creates 4 new trapezoids (7 new nodes)
* Case 3: no endpoints in trapezoid - creates 2 new trapezoids (3 new nodes)

Psuedocode

```
function insertSeg(segment, tmap) {
    // takes in a segment and a trapezoidal map
    // inserts the segment into the map
    trapsList = findTrapsCrossed(segment,tmap)
    // for each trapezoid, we can assume that the segment passes through it, so we only need to check endpoints
    for t in trapsList {
        p = t.parent
        if(t.is_within(segment.p1) && t.is_within(segment.p2)) {
            // case 2
        }
        else if(t.is_within(segment.p1) || t.is_within(segment.p2)) {
            // case 1
        }
        else {
            // case 3 
        }
    }
}

function findTrapsCrossed(segment,tmap) {
    // takes in a segment and trapezoidal map
    // traverses the map to find each trapezoid crossed by the segment
    // it may be best or tlist to be a sort of dictionary with the trapezoid and the point used to select it from the x_node
    tlist = []
    x_nodes_to_check = []
    // traverse to L endpoint
    currentNode = tmap.root
    last_point = null;
    while(currentNode has children) {
        if currentNode is x_node {
            if direction for segment.p1 and segment.p2 are not equal {
                x_nodes_to_check.append(new point(currentNode.point.x,segment.getYpos(currentNode.point.x)));
            }
            last_point = currentNode.point
        }
        currentNode = currentNode.traverse(segment.p1);
    }
    tlist.append(currentNode,last_point);
    // traverse to R endpoint
    currentNode = tmap.root
    while(currentNode has children) {
        if currentNode is x_node {
            if direction for segment.p1 and segment.p2 are not equal and currentNode not in x_nodes_to_check {
                x_nodes_to_check.append(new point(currentNode.point.x,segment.getYpos(currentNode.point.x)))
            }
            last_point = currentNode.point
        }
        currentNode = currentNode.traverse(segment.p2);
    }
    tlist.append(currentNode, last_point);
    // sort the list of new points by x value
    x_nodes_to_check.sort()
    // traverse the list of new points, adding points to the list if they need to be explored
    // perhaps change the x_nodes_to_check to a priority queue? Then this would be a while loop, rather than a for loop, but otherwise be the same
    for point in x_nodes_to_check {
        currentNode = tmap.root
        while currentNode has children {
            if currentNode is x_node {
                if direction for point and segment.p2 are not equal and currentNode not in x_nodes_to_check {
                    x_nodes_to_check.append(new point(currentNode.point.x,segment.getYpos(currentNode.point.x)))
                }
                last_point = currentNode.point
            }
            currentNode = currentNode.traverse(point);
        }
        tlist.append(currentNode, last_point);
    }
    return tlist;
}
```