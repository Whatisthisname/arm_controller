class Trail {

  points: [v2, boolean][]
  max_points: number
  min_dist: number
  max_dist: number

  constructor(max_points: number, min_dist: number, max_dist: number) {
    this.points = []
    this.max_points = max_points
    this.min_dist = min_dist
    this.max_dist = max_dist
  }

  update(pos: v2) : boolean {
    if (this.points.length > this.max_points) {
      this.points.shift()
    }
    if (this.points.length == 0) {
      this.points.push([pos, true])
      return true
    } else {
      const dist = v2.distance(this.points[this.points.length - 1][0], pos)
      if (dist > this.min_dist) {
        this.points.push([pos, dist < this.max_dist])
        return true
      }
    }
    return false
  }

  draw(coord: coordinateSystem, color: Color) {
    for (let i = 0; i < this.points.length - 1; i++) {
      if (!this.points[i+1][1] ) {
        continue
      }
      const element = this.points[i][0];
      const element2 = this.points[i + 1][0];
      coord.line(element, element2, color)
    }
  }
}