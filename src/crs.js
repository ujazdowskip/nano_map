const {PI} = Math
import SphericalMercator from './sphericalmercator'
import Transformation from './transformation'

class CRS {

	constructor() {
		this.projection = new SphericalMercator()
		const earthRadius = 6378137

		const scale = 0.5 / (PI * earthRadius);

		this.transformation = new Transformation(scale, 0.5, -scale, 0.5)
	}

	// @method scale(zoom: Number): Number
	// Returns the scale used when transforming projected coordinates into
	// pixel coordinates for a particular zoom.
	// `256 * 2^zoom` for Mercator-based CRS.
	scale(zoom) {
		return 256 * Math.pow(2, zoom);
	}

	// @method zoom(scale: Number): Number
	// Inverse of `scale()`, returns the zoom level corresponding to a scale
	// factor of `scale`.
	zoom(scale) {
		return Math.log(scale / 256) / Math.LN2;
	}

	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
	// Projects geographical coordinates into pixel coordinates for a given zoom.
  latLngToPoint(latlng, zoom) {
		const projectedPoint = this.projection.project(latlng)
		const scale = this.scale(zoom)

		return this.transformation.transform(projectedPoint, scale)
	}

	// @method pointToLatLng(point: Point, zoom: Number): LatLng
	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
	// zoom into geographical coordinates.
	pointToLatLng(point, zoom) {
		const scale = this.scale(zoom)
		const untransformedPoint = this.transformation.untransform(point, scale);

		const result = this.projection.unproject(untransformedPoint);

		return result
	}
}

module.exports = CRS
