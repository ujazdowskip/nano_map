class Point {

  constructor(x, y, round) {
    if (x instanceof Point) {
      return x;
    }

    if (Array.isArray(x)) {
      return this._constructor(x[0], x[1])
    }
    if (x === undefined || x === null) {
      return x;
    }
    if (typeof x === 'object' && 'x' in x && 'y' in x) {
      return this._constructor(x.x, x.y);
    }

    return this._constructor(x, y, round)
  }

  _constructor(x, y, round) {
    this.x = (round ? Math.round(x) : x)
    this.y = (round ? Math.round(y) : y)
  }

	// @method clone(): Point
	// Returns a copy of the current point.
	clone() {
		return new Point(this.x, this.y)
	}

	// @method add(otherPoint: Point): Point
	// Returns the result of addition of the current and the given points.
	add(point) {
		// non-destructive, returns a new point
		return this.clone()._add(new Point(point))
	}

	_add(point) {
		// destructive, used directly for performance in situations where it's safe to modify existing point
		this.x += point.x
		this.y += point.y
		return this
	}

	// @method subtract(otherPoint: Point): Point
	// Returns the result of subtraction of the given point from the current.
	subtract(point) {
		return this.clone()._subtract(new Point(point))
	}

	_subtract(point) {
		this.x -= point.x
		this.y -= point.y
		return this
	}

	// @method divideBy(num: Number): Point
	// Returns the result of division of the current point by the given number.
	divideBy(num) {
		return this.clone()._divideBy(num)
	}

	_divideBy(num) {
		this.x /= num
		this.y /= num
		return this
	}

	// @method multiplyBy(num: Number): Point
	// Returns the result of multiplication of the current point by the given number.
	multiplyBy(num) {
		return this.clone()._multiplyBy(num)
	}

	_multiplyBy(num) {
		this.x *= num
		this.y *= num
		return this
	}

	// @method scaleBy(scale: Point): Point
	// Multiply each coordinate of the current point by each coordinate of
	// `scale`. In linear algebra terms, multiply the point by the
	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
	// defined by `scale`.
	scaleBy(point) {
		return new Point(this.x * point.x, this.y * point.y)
	}

	// @method unscaleBy(scale: Point): Point
	// Inverse of `scaleBy`. Divide each coordinate of the current point by
	// each coordinate of `scale`.
	unscaleBy(point) {
		return new Point(this.x / point.x, this.y / point.y)
	}

	// @method round(): Point
	// Returns a copy of the current point with rounded coordinates.
	round() {
		return this.clone()._round()
	}

	_round() {
		this.x = Math.round(this.x)
		this.y = Math.round(this.y)
		return this
	}

	// @method floor(): Point
	// Returns a copy of the current point with floored coordinates (rounded down).
	floor() {
		return this.clone()._floor()
	}

	_floor() {
		this.x = Math.floor(this.x)
		this.y = Math.floor(this.y)
		return this
	}

	// @method ceil(): Point
	// Returns a copy of the current point with ceiled coordinates (rounded up).
	ceil() {
		return this.clone()._ceil()
	}

	_ceil() {
		this.x = Math.ceil(this.x)
		this.y = Math.ceil(this.y)
		return this
	}

	// @method distanceTo(otherPoint: Point): Number
	// Returns the cartesian distance between the current and the given points.
	distanceTo(point) {
		point = new Point(point)

		const x = point.x - this.x
		const y = point.y - this.y

		return Math.sqrt(x * x + y * y)
	}

	// @method equals(otherPoint: Point): Boolean
	// Returns `true` if the given point has the same coordinates.
	equals(point) {
		point = new Point(point);

		return point.x === this.x && point.y === this.y
	}

	// @method contains(otherPoint: Point): Boolean
	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
	contains(point) {
		point = new Point(point);

		return Math.abs(point.x) <= Math.abs(this.x) && Math.abs(point.y) <= Math.abs(this.y)
	}

	// @method toString(): String
	// Returns a string representation of the point for debugging purposes.
	toString() {
		return `Point(${this.x}, ${this.y})`
	}
}

module.exports = Point
