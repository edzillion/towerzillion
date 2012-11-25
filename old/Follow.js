/**
 * Pathing class
 *
 * @author edzillion
 */

/**
 * @constructor
 */
 var Path = function(start,path,speed) {  

  this.startpoint = new Point(start.x,start.y);
  this.path = Array();
  if(Array.isArray(path))
    this.path = path
  else {
    this.path[0] = this.startpoint;
    this.path[1] = path; //vector2 array
  }

  this.velocity = 'velocity'; 
  this.speed = speed; //in seconds: fixthis
  this.time = 0.0; 
  this.len = 0.0;
  this.degrees = 0;

  this.endpoint = new Point(this.path[this.path.length-1].x,this.path[this.path.length-1].y);
  this.startseg = 'startseg';
  this.endseg = 'endseg';
  this.segment = 0;
  this.EnterSegment(0);
}

Path.prototype.EnterSegment = function(seg)
{
  this.segment = seg;
  if (this.segment < this.path.length-1)
  {  
    //init segment vars
    this.startseg = new Point(this.path[this.segment].x,this.path[this.segment].y);
    this.endseg = new Point(this.path[this.segment+1].x,this.path[this.segment+1].y);
    this.len = this.endseg.subtract(this.startseg).length();
    this.time = 0.0; 

    this.degrees = this.startseg.degreesTo(this.endseg);
    if (this.degrees > 360)
      this.degrees -= 360
    else if (this.degrees < 0)
      this.degrees += 360
  }
}

// move along path
Path.prototype.Move = function (elapsedsecs,speed)
{
  var spd = this.speed
  //if speed param is set then we temporarily use that speed
  if(speed)
      spd = speed; //in seconds: fixthis 

  this.time += elapsedsecs * spd;
  //if at end of segment, move to a new segment
  if (this.time >= this.len)
    this.EnterSegment(this.segment + 1);

  //if still on current segment calculate my position along the current segment (or, if complete, just return endpoint)
  var direction = new Point();
  var distance = new Point();
  var movereturned = new Point();

  if (this.segment >= this.path.length-1)  
    movereturned = this.endpoint;
  else {
    var direction = this.endseg.subtract(this.startseg);
    var distance = direction.multiply(this.time / this.len);
    movereturned = this.startseg.add(distance); 
  }

  //return the ratio of the length along the current segment, and the direction currently travelling
  var ratio = this.time / this.len;
  movereturned.ratio = ratio;
  movereturned.degrees = this.degrees;

  //  return true as long as I'm still following the path
  if (this.segment >= this.path.length)
    return false;
  else 
    return movereturned;
}