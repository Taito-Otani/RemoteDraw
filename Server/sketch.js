var database;
let CLIENT_WIDTH = 400;
let CLIENT_HEIGHT = 400;

var posx = 0;
var posy = 0;
var d = [];

var c = [];
var rootList;

var allParticles = [[],[],[],[],[],[],[],[]];
var maxLevel = 5;
var useFill = false;
var data = [];

function Particle(x, y, level, _allPat) {
  this.level = level;
  this.life = 0;

  this.pos = new p5.Vector(x, y);
  this.vel = p5.Vector.random2D();
  this.vel.mult(map(this.level, 0, maxLevel, 5, 2));
  this.allPat = _allPat;

  this.move = function() {
    this.life++;
    // Add friction.
    this.vel.mult(0.9);
    this.pos.add(this.vel);

    // Spawn a new particle if conditions are met.
    if (this.life % 10 == 0) {
      if (this.level > 0) {
        this.level -= 1;
        var newParticle = new Particle(this.pos.x, this.pos.y, this.level - 1,this.allPat);
        _allPat.push(newParticle);
      }
    }
  }
}


function setup() {
  createCanvas(windowWidth,windowHeight);

  // You have to write your firebase config
  /// Firebase Config 
  var firebaseConfig = {
    apiKey: "xxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "xxxxxxxxxxxxxxxxxxxxxx",
    databaseURL: "xxxxxxxxxxxxxxxxxxxxxx",
    projectId: "xxxxxxxxxxxxxxxxxxxxxx",
    storageBucket: "xxxxxxxxxxxxxxxxxxxxxx",
    messagingSenderId: "xxxxxxxxxxxxxxxxxxxxxx",
    appId: "xxxxxxxxxxxxxxxxxxxxxx",
    measurementId: "xxxxxxxxxxxxxxxxxxxxxx"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  database = firebase.database();
  c = [color(255, 78,98), color(46,207,202), color(32,217,119)];
  frameRate(24);
  // noLoop();
  // noStroke();
  noFill();
  getData();
  setInterval("getData()", 10000); // 10秒に一回データを取得
}

function draw() {
  background(20, 50);

  // 必要に応じて描画する。
  if (rootList != null) {
    for (var i = 0; i < 3; i++) {
      if (d[i] < rootList[i].length) {
        posx = rootList[i][d[i]].posx;
        posy = rootList[i][d[i]].posy;
        posx = map(posx, 0, CLIENT_WIDTH, 0, width);
        posy = map(posy, 0, CLIENT_HEIGHT, 0, height);
        // fill

        stroke(c[i],80);

        drawPat(allParticles[i]);
        allParticles[i].push(new Particle(posx, posy, maxLevel,allParticles[i]));

        ellipse(posx, posy, 10, 10);
        // push();
        // translate(posx-width*0.5,posy-height*0.5);
        // sphere(10);
        // pop();
      } else {
        d[i] = 0;
        useFill = !useFill;
      }
      d[i]++;
    }
  }
}

function drawPat(_allPat) {
  for (var i = _allPat.length - 1; i > -1; i--) {
    _allPat[i].move();

    if (_allPat[i].vel.mag() < 0.01) {
      _allPat.splice(i, 1);
    }
  }

  if (_allPat.length > 0) {
    // Run script to get points to create triangles with.
    data = Delaunay.triangulate(_allPat.map(function(pt) {
      return [pt.pos.x, pt.pos.y];
    }));

    strokeWeight(0.1);

    // Display triangles individually.
    for (var i = 0; i < data.length; i += 3) {
      // Collect particles that make this triangle.
      var p1 = _allPat[data[i]];
      var p2 = _allPat[data[i + 1]];
      var p3 = _allPat[data[i + 2]];

      // Don't draw triangle if its area is too big.
      var distThresh = 75;

      if (dist(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y) > distThresh) {
        continue;
      }

      if (dist(p2.pos.x, p2.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }

      if (dist(p1.pos.x, p1.pos.y, p3.pos.x, p3.pos.y) > distThresh) {
        continue;
      }

      // Base its hue by the particle's life.
      // if (useFill) {
      //   noStroke();
      //   // fill(165 + p1.life * 1.5, 360, 360);
      // } else {
      //   noFill();
      //   stroke(165 + p1.life * 1.5, 360, 360);
      // }

      triangle(p1.pos.x, p1.pos.y,
        p2.pos.x, p2.pos.y,
        p3.pos.x, p3.pos.y);
    }
  }
}


function getData() {
  let pos = database.ref("pos/").once("value", (data) => {
    if (data) {
      rootList = data.val();
      console.log("pull data" + Date.now());
    }

  });
}


// Dekaybay

/*
Orginally from Jay LaPorte at https://github.com/ironwallaby/delaunay/blob/master/delaunay.js
Tweaked it so instead of raising an error it would return an empty list.
*/

var Delaunay;

(function() {
  "use strict";

  var EPSILON = 1.0 / 1048576.0;

  function supertriangle(vertices) {
    var xmin = Number.POSITIVE_INFINITY,
      ymin = Number.POSITIVE_INFINITY,
      xmax = Number.NEGATIVE_INFINITY,
      ymax = Number.NEGATIVE_INFINITY,
      i, dx, dy, dmax, xmid, ymid;

    for (i = vertices.length; i--;) {
      if (vertices[i][0] < xmin) xmin = vertices[i][0];
      if (vertices[i][0] > xmax) xmax = vertices[i][0];
      if (vertices[i][1] < ymin) ymin = vertices[i][1];
      if (vertices[i][1] > ymax) ymax = vertices[i][1];
    }

    dx = xmax - xmin;
    dy = ymax - ymin;
    dmax = Math.max(dx, dy);
    xmid = xmin + dx * 0.5;
    ymid = ymin + dy * 0.5;

    return [
      [xmid - 20 * dmax, ymid - dmax],
      [xmid, ymid + 20 * dmax],
      [xmid + 20 * dmax, ymid - dmax]
    ];
  }

  function circumcircle(vertices, i, j, k) {
    var x1 = vertices[i][0],
      y1 = vertices[i][1],
      x2 = vertices[j][0],
      y2 = vertices[j][1],
      x3 = vertices[k][0],
      y3 = vertices[k][1],
      fabsy1y2 = Math.abs(y1 - y2),
      fabsy2y3 = Math.abs(y2 - y3),
      xc, yc, m1, m2, mx1, mx2, my1, my2, dx, dy;

    /* Check for coincident points */
    if (fabsy1y2 < EPSILON && fabsy2y3 < EPSILON)
      return;
    //throw new Error("Eek! Coincident points!");

    if (fabsy1y2 < EPSILON) {
      m2 = -((x3 - x2) / (y3 - y2));
      mx2 = (x2 + x3) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc = (x2 + x1) / 2.0;
      yc = m2 * (xc - mx2) + my2;
    } else if (fabsy2y3 < EPSILON) {
      m1 = -((x2 - x1) / (y2 - y1));
      mx1 = (x1 + x2) / 2.0;
      my1 = (y1 + y2) / 2.0;
      xc = (x3 + x2) / 2.0;
      yc = m1 * (xc - mx1) + my1;
    } else {
      m1 = -((x2 - x1) / (y2 - y1));
      m2 = -((x3 - x2) / (y3 - y2));
      mx1 = (x1 + x2) / 2.0;
      mx2 = (x2 + x3) / 2.0;
      my1 = (y1 + y2) / 2.0;
      my2 = (y2 + y3) / 2.0;
      xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
      yc = (fabsy1y2 > fabsy2y3) ?
        m1 * (xc - mx1) + my1 :
        m2 * (xc - mx2) + my2;
    }

    dx = x2 - xc;
    dy = y2 - yc;
    return {
      i: i,
      j: j,
      k: k,
      x: xc,
      y: yc,
      r: dx * dx + dy * dy
    };
  }

  function dedup(edges) {
    var i, j, a, b, m, n;

    for (j = edges.length; j;) {
      b = edges[--j];
      a = edges[--j];

      for (i = j; i;) {
        n = edges[--i];
        m = edges[--i];

        if ((a === m && b === n) || (a === n && b === m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }
  }

  Delaunay = {
    triangulate: function(vertices, key) {
      var n = vertices.length,
        i, j, indices, st, open, closed, edges, dx, dy, a, b, c;

      /* Bail if there aren't enough vertices to form any triangles. */
      if (n < 3)
        return [];

      /* Slice out the actual vertices from the passed objects. (Duplicate the
       * array even if we don't, though, since we need to make a supertriangle
       * later on!) */
      vertices = vertices.slice(0);

      if (key)
        for (i = n; i--;)
          vertices[i] = vertices[i][key];

      /* Make an array of indices into the vertex array, sorted by the
       * vertices' x-position. */
      indices = new Array(n);

      for (i = n; i--;)
        indices[i] = i;

      indices.sort(function(i, j) {
        return vertices[j][0] - vertices[i][0];
      });

      /* Next, find the vertices of the supertriangle (which contains all other
       * triangles), and append them onto the end of a (copy of) the vertex
       * array. */
      st = supertriangle(vertices);
      vertices.push(st[0], st[1], st[2]);

      /* Initialize the open list (containing the supertriangle and nothing
       * else) and the closed list (which is empty since we havn't processed
       * any triangles yet). */
      var circCircle = circumcircle(vertices, n + 0, n + 1, n + 2);
      if (circCircle == undefined)
        return [];

      open = [circumcircle(vertices, n + 0, n + 1, n + 2)];
      closed = [];
      edges = [];

      /* Incrementally add each vertex to the mesh. */
      for (i = indices.length; i--; edges.length = 0) {
        c = indices[i];

        /* For each open triangle, check to see if the current point is
         * inside it's circumcircle. If it is, remove the triangle and add
         * it's edges to an edge list. */
        for (j = open.length; j--;) {
          /* If this point is to the right of this triangle's circumcircle,
           * then this triangle should never get checked again. Remove it
           * from the open list, add it to the closed list, and skip. */
          dx = vertices[c][0] - open[j].x;
          if (dx > 0.0 && dx * dx > open[j].r) {
            closed.push(open[j]);
            open.splice(j, 1);
            continue;
          }

          /* If we're outside the circumcircle, skip this triangle. */
          dy = vertices[c][1] - open[j].y;
          if (dx * dx + dy * dy - open[j].r > EPSILON)
            continue;

          /* Remove the triangle and add it's edges to the edge list. */
          edges.push(
            open[j].i, open[j].j,
            open[j].j, open[j].k,
            open[j].k, open[j].i
          );
          open.splice(j, 1);
        }

        /* Remove any doubled edges. */
        dedup(edges);

        /* Add a new triangle for each edge. */
        for (j = edges.length; j;) {
          b = edges[--j];
          a = edges[--j];
          open.push(circumcircle(vertices, a, b, c));
        }
      }

      /* Copy any remaining open triangles to the closed list, and then
       * remove any triangles that share a vertex with the supertriangle,
       * building a list of triplets that represent triangles. */
      for (i = open.length; i--;)
        closed.push(open[i]);
      open.length = 0;

      for (i = closed.length; i--;)
        if (closed[i].i < n && closed[i].j < n && closed[i].k < n)
          open.push(closed[i].i, closed[i].j, closed[i].k);

      /* Yay, we're done! */
      return open;
    },
    contains: function(tri, p) {
      /* Bounding box test first, for quick rejections. */
      if ((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
        (p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
        (p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
        (p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1]))
        return null;

      var a = tri[1][0] - tri[0][0],
        b = tri[2][0] - tri[0][0],
        c = tri[1][1] - tri[0][1],
        d = tri[2][1] - tri[0][1],
        i = a * d - b * c;

      /* Degenerate tri. */
      if (i === 0.0)
        return null;

      var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i,
        v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

      /* If we're outside the tri, fail. */
      if (u < 0.0 || v < 0.0 || (u + v) > 1.0)
        return null;

      return [u, v];
    }
  };

  if (typeof module !== "undefined")
    module.exports = Delaunay;
})();
