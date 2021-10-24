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