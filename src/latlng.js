import util from './util'
import LatLngBounds from './latlngbounds'

const {abs, max, min, PI, sin, cos, acos} = Math
const rad = PI / 180

// distance between two geographical points using spherical law of cosines approximation
function distance (latlng1, latlng2) {
  const lat1 = latlng1.lat * rad
  const lat2 = latlng2.lat * rad
  const a = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos((latlng2.lng - latlng1.lng) * rad)

  return 6371000 * acos(min(a, 1));
}

class LatLng {
  constructor(a, b, c) {
    if (a instanceof LatLng) {
      return a;
    }
    if (Array.isArray(a) && typeof a[0] !== 'object') {
      if (a.length === 3) {
        return this._constructor(a[0], a[1], a[2])
      }

      if (a.length === 2) {
        return this._constructor(a[0], a[1])
      }
      return null;
    }

    if (a === undefined || a === null) {
      return a
    }

    if (typeof a === 'object' && 'lat' in a) {
      return this._constructor(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
    }
    if (b === undefined) {
      return null;
    }

    return this._constructor(a, b, c)
  }

  _constructor(lat, lng, alt) {
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
    }

    // @property lat: Number
    // Latitude in degrees
    this.lat = +lat

    // @property lng: Number
    // Longitude in degrees
    this.lng = +lng

    // @property alt: Number
    // Altitude in meters (optional)
    if (alt !== undefined) {
      this.alt = +alt
}
  }

	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overriden by setting `maxMargin` to a small number.
	equals(obj, maxMargin) {
		if (!obj) { return false }

		obj = new LatLng(obj);

		const margin = max(abs(this.lat - obj.lat), abs(this.lng - obj.lng))

		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
	}

	// @method toString(): String
	// Returns a string representation of the point (for debugging purposes).
	toString(precision) {
    return `LatLng(${this.lat.toFixed(precision)}, ${this.lng.toFixed(precision)})`
	}


	// @method distanceTo(otherLatLng: LatLng): Number
	// Returns the distance (in meters) to the given `LatLng` calculated using the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula).
	distanceTo(other) {
		return distance(this, new LatLng(other))
	}

	// @method wrap(): LatLng
	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
  wrap(latlng) {
		const lng = util.wrapNum(latlng.lng, [-180, 180], true)

		return new LatLng(latlng.lat, lng, latlng.alt)
	}

	// @method toBounds(sizeInMeters: Number): LatLngBounds
	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters` meters apart from the `LatLng`.
	toBounds(sizeInMeters) {
		const latAccuracy = 180 * sizeInMeters / 40075017
		const lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat)

		return LatLngBounds(
      [this.lat - latAccuracy, this.lng - lngAccuracy],
      [this.lat + latAccuracy, this.lng + lngAccuracy]
    )
	}

	clone() {
		return new LatLng(this.lat, this.lng, this.alt)
	}
}

module.exports = LatLng
