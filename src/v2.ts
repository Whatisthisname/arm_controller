export class v2 {
    constructor(public x: number = 0, public y: number = 0) {}
  
    // basic vector arithmetic
    add(other: v2): v2 {
      return new v2(this.x + other.x, this.y + other.y);
    }
  
    sub(other: v2): v2 {
      return new v2(this.x - other.x, this.y - other.y);
    }
  
    scale(scalar: number): v2 {
      return new v2(this.x * scalar, this.y * scalar);
    }
  
    // vector magnitude and normalization
    get magnitude(): number {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    copy(): v2 {
        return new v2(this.x, this.y);
    }
  
    normalize(): v2 {
      const magnitude = this.magnitude;
      return new v2(this.x / magnitude, this.y / magnitude);
    }
  
    // dot product and angle calculation
    dot(other: v2): number {
      return this.x * other.x + this.y * other.y;
    }
  
    distance(other: v2): number {
      return v2.distance(this, other);
    }

    angle(other: v2): number {
      const dotProduct = this.dot(other);
      const cosAngle = dotProduct / (this.magnitude * other.magnitude);
      return Math.acos(cosAngle);
    }
  
    // static vector operations
    static fromPolar(angle: number, magnitude: number): v2 {
      const x = magnitude * Math.cos(angle);
      const y = magnitude * Math.sin(angle);
      return new v2(x, y);
    }
  
    static zero(): v2 {
      return new v2();
    }

    static distance(a: v2, b: v2): number {
      return a.sub(b).magnitude
    }
  }
  