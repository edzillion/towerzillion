
var Vector2 = function(floatx, floaty) { 
 
    this.x = floatx;
    this.y = floaty;
}

Vector2.prototype.length = function {
    return Math.sqrt(this.x*this.x + this.y*this.y); 
}

Vector2.prototype.toString = function() {
    //return String.Format("{0:0.0},{1:0.0}", this.x, this.y);
}
 
Vector2.prototype.add = function(vectortoadd) {
    return new Vector2(this.x + vectortoadd.x, this.y + vectortoadd.y);
}    

Vector2.prototype.subtract = function(vectortosub) {
    return new Vector2(this.x - vectortosub.x, this.y - vectortosub.y);
}

Vector2.prototype.subtract = function(multiplier) {
    return new Vector2(this.x * multiplier, this.y * multiplier);
}

    public static Vector2 operator -(Vector2 a, Vector2 o) { return new Vector2(a.X - o.X, a.Y - o.Y); }
    public static Vector2 operator *(Vector2 a, float s) { return new Vector2(a.X * s, a.Y * s); }
}