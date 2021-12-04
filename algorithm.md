RANDOMIZED INCREMENTAL ALGORITHM
=======
The randomized incremental algorithm for building a trapezoidal map is designed to have $O(nlogn)$ construction time, with $O(logn)$ query time. Conceptually, one can build a trapezoidal map by inserting segments into an already-existing trapezoidal map, deleting each trapezoid intersected by the new segment, and creating new trapezoids in $O(1)$ time based on the trapezoid being destroyed and its relationship to the segment. However, an adversary could present segments in an order such that almost every trapezoid is intersected by each new segment, leading to an $O(n^2)$ complexity. The randomized incremental algorithm avoids this by shuffling the segments before insertion, an $O(n)$ operation that then renders the highest likelihood cost of an insertion to some small number $k$. With this adjustment, the time complexity of the insertion is most likely $O(nlogn)$, and the resulting point-location data structure is also more balanced, leading queries to operate on approximately $O(logn)$ time. 

The most difficult aspect of implementing this algorithm lies in the "detecting intersected trapezoids" portion. The most commonly suggested method utilizes a Doubly-Connected Edge List to represent points, segments and trapezoids, such that each trapezoid "knows" what structures it is attached to, and therefore it is possible to "walk" along the path of the segment to determine what trapezoids are adjacent to the current trapezoid. However, there are situations where this is a non-trivial question, particularly in cases where we don't have general position, such as when our segments are arranged in a zig-zagging stack where each left joint is at the same x-position. If there are multiple adjacent trapezoids, the DECL requires some sort of searching to determine adjacency, and this can lead to a number of queries up and down the list. 

Rather than working with that structure, we opted to utilize the Point-Location data structure instead, as we were already generating it, and knew that it was quick to query. Our algorithm follows each endpoint of the segment in question down the tree, marking each X-node where the endpoints diverge. The trapezoids that contain the segment endpoints are added to our output list, and then the segment position at each marked x-node is queried. Each x-node encountered during that query that has segment endpoints diverge is added to the set of x-nodes to check, and each trapezoid encountered is added to the output list. Once all x-nodes have been explored, we return the list of trapezoids. In pseudocode:

```
FIND_TRAPS_CROSSED(segment,t_map)
    T = {}
    X_NODES = {}
    c_node = t_map.root
    while(c_node.has_children)
        if(c_node.navigate(segment.p1) != c_node.navigate(segment.p2) AND c_node is type(X_NODE))
            THEN ADD(c_node,X_NODES)
        c_node = c_node.navigate(segment.p1)
    ADD(c_node,T)
    c_node = t_map.root
    while(c_node.has_children)
        if(c_node.navigate(segment.p1) != c_node.navigate(segment.p2) AND c_node is type(X_NODE))
            THEN ADD(c_node,X_NODES)
        c_node = c_node.navigate(segment.p2)
    ADD(c_node,T)

    while(X_NODES is not empty)
        c_node = X_NODES.pop()
        while(c_node.has_children)
            if(c_node.navigate(segment.p1) != c_node.navigate(segment.p2) AND c_node is type(X_NODE))
                THEN ADD(c_node,X_NODES)
            c_node = c_node.navigate(segment.p2)
        ADD(c_node,T)
    
    return T
```

