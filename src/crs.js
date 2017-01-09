const {PI} = Math
import SphericalMercator from './sphericalmercator'
import Transformation from './transformation'

class CRS {

	constructor() {
		this.projection = new SphericalMercator()

		const scale = 0.5 / (PI * 6378137);

		this.transformation = new Transformation(scale, 0.5, -scale, 0.5)
	}

	scale(zoom) {
		return 256 * Math.pow(2, zoom);
	}

  latLngToPoint(latlng, zoom) {
		//not working correctly
		const projectedPoint = this.projection.project(latlng)
		const scale = this.scale(zoom)

		return this.transformation.transform(projectedPoint, scale)
	}

	pointToLatLng(point, zoom) {
		//not working corectly
		const scale = this.scale(zoom)
		const untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	}
}

module.exports = CRS
