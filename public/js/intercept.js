/**
 * Return the firing solution for a projectile starting at 'src' with
 * velocity 'v', to hit a target, 'dst'.
 *
 * @param Object src position of shooter
 * @param Object dst position & velocity of target
 * @param Number v   speed of projectile
 * @return Object Coordinate at which to fire (and where intercept occurs)
 *
 * E.g.
 * >>> intercept({x:2, y:4}, {x:5, y:7, vx: 2, vy:1}, 5)
 * = {x: 8, y: 8.5}
 */
function intercept(src, dst, v) {
 /* var src = {x: sourcepoint.x*10, y: sourcepoint.y*10};
  var dst = {x: destpoint.x*10, y: destpoint.y*10, vx: destpoint.vx*10, vy: destpoint.vy*10};
  var v = velocity*10;*/

  var tx = dst.x - src.x,
      ty = dst.y - src.y,
      tvx = dst.vx,
      tvy = dst.vy;

  // Get quadratic equation components
  var a = tvx*tvx + tvy*tvy - v*v;
  var b = 2 * (tvx * tx + tvy * ty);
  var c = tx*tx + ty*ty;    

  // Solve quadratic
  var ts = quad(a, b, c); // See quad(), below

  // Find smallest positive solution
  var sol = null;
  if (ts) {
    var t0 = ts[0], t1 = ts[1];
    t = Math.min(t0, t1);
    if (t < 0) t = Math.max(t0, t1);    
    if (t > 0) {
      sol = {
        x: (dst.x + dst.vx*t),///10,
        y: (dst.y + dst.vy*t)///10
      };
    }
  }

  return sol;
}


/**
 * Return solutions for quadratic
 */
function quad(a,b,c) {
  var sol = null;
  if (Math.abs(a) < 1e-6) {
    if (Math.abs(b) < 1e-6) {
      sol = Math.abs(c) < 1e-6 ? [0,0] : null;
    } else {
      sol = [-c/b, -c/b];
    }
  } else {
    var disc = b*b - 4*a*c;
    if (disc >= 0) {
      disc = Math.sqrt(disc);
      a = 2*a;
      sol = [(-b-disc)/a, (-b+disc)/a];
    }
  }
  return sol;
}