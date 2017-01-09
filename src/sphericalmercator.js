import LatLng from './point'
import Point from './point'

const {min, max, sin, log, PI, atan, exp} = Math

class SphericalMercator {

	constructor() {
		this.R = 6378137
		this.MAX_LATITUDE = 85.0511287798
		this.d = PI / 180
	}


	project(latlng) {
		const d = this.d
		const R = this.R
		const maxLat = this.MAX_LATITUDE
		const lat = max(min(maxLat, latlng.lat), -maxLat)
		const sinA = sin(lat * d)

		return new Point(
			R * latlng.lng * d,
			R * log((1 + sinA) / (1 - sinA)) / 2
		)
	}

	unproject(point) {
		const d = this.d
		const R = this.R

		return new LatLng(
			(2 * atan(exp(point.y / R)) - (PI / 2)) * d,
			point.x * d / R);
	}

	/*
	TODO
	bounds: (function () {
		var d = 6378137 * Math.PI;
		return L.bounds([-d, -d], [d, d]);
	})()*/
}

module.exports = SphericalMercator
