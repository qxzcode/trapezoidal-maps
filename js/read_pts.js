
class Point {
    constructor(x1, y1) {
        this.x = x1;
        this.y = y1;
    }
}

class Edge {
    constructor(p1, p2) {
        if(p1.x < p2.x) {
            this.start = p1;
            this.end = p2;
        }
        else {
            this.start = p2;
            this.end = p1;
        }
    }
}

var file = '../InputFiles/tdl1818.txt';
var rawFile = new XMLHttpRequest();
var allText = 'ERROR';
rawFile.open("GET", file, false);
rawFile.onreadystatechange = function ()
{
    if(rawFile.readyState === 4)
    {
        if(rawFile.status === 200 || rawFile.status == 0)
        {
            allText = rawFile.responseText;
        }
    }
}
rawFile.send(null);

const lines = allText.split('\n');

let nlines = parseInt(lines[0]);

let bbox = lines[1].split(' ');

let pts = [];

for (let index = 2; index < lines.length; index++) {
    const element = lines[index];
    let vals = element.split(' ');
    let pt1 = Point(parseInt(vals[0]), parseInt(vals[1]));
    let pt2 = Point(parseInt(vals[2]), parseInt(vals[2]));
    pts.push(new Edge(pt1, pt2));
}