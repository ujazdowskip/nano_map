import map_utils from './map_utils'
import MapTheTiles from './map-the-tiles'
import CRS from './crs'
import Point from './point'
import LatLng from './latlng'

window.NM = {
  Point,
  LatLng
}

class NanoMap {
  constructor(opts) {
    this.zoom = opts.zoom || 10
    this.lat = opts.lat || 0
    this.lng = opts.lng || 0

    this.$map = document.getElementById(opts.mapSelector)
    this.ctx = this.$map.getContext("2d");
    this.width = this.$map.offsetWidth
    this.height = this.$map.offsetHeight
    this.offsetLeft = this.$map.offsetLeft
    this.offsetTop = this.$map.offsetTop
    this.crs = new CRS()


    this.tiler = new MapTheTiles(null, 256)

    this._currentLayout = null

    this.init()

    console.log(this);
  }

  init() {
    this._initEvents()
    const layout = this.renderLayout()

    this._currentLayout = layout

    this.drawTiles()
  }


  _onMove(evt) {
    evt.preventDefault();

    const xDiff = this.currentClientXY.x - evt.layerX
    const yDiff = this.currentClientXY.y - evt.layerY

    this.currentClientXY.x = this.currentClientXY.x - xDiff
    this.currentClientXY.y = this.currentClientXY.y - yDiff


    this.currentPixelCenter = this.currentPixelCenter.add({
      x: xDiff,
      y: yDiff
    })

    const newLatLng = this.unproject(this.currentPixelCenter)

    this.lat = newLatLng.lat
    this.lng = newLatLng.lng

    this._recomputeLayout()
  }

  _initEvents() {
    const $map = this.$map


    const onMove = this._onMove.bind(this)

    $map.addEventListener('mousedown', (evt) => {

      this.currentClientXY = {
        x: evt.layerX,
        y: evt.layerY
      }


      this.currentPixelCenter = this.getPixelOrigin().add({
        x: 300,
        y: 300
      })

      evt.preventDefault()
      $map.addEventListener('mousemove', onMove)
    })

    $map.addEventListener('mouseup', () => {
      this.currentClientXY = {}
      this.currentPixelCenter = null

      $map.removeEventListener('mousemove', onMove)
    })

    $map.addEventListener('mouseleave', () => {
      $map.removeEventListener('mousemove', onMove)
    })

    const $zoomin = document.querySelector('button[name="zoomin"]')
    $zoomin.addEventListener('click', () => {
      this.zoom++
      this._recomputeLayout()
    })

    const $zoomout = document.querySelector('button[name="zoomout"]')
    $zoomout.addEventListener('click', (evt) => {
      this.zoom -= 1
      this._recomputeLayout()
    })
  }

  _recomputeLayout() {
    const newLayout = this.renderLayout()
    const $map = this.$map
    this.ctx.clearRect(0, 0, $map.width, $map.height);

    newLayout.forEach((value, key) => {
      if(this._currentLayout.has(key)) {
        const toUpdate = this._currentLayout.get(key)
        toUpdate.x = value.x
        toUpdate.y = value.y
      } else {
        this._currentLayout.set(key, value)
      }
    })

    this.drawTiles()
  }



  drawTiles() {
    const layout = this._currentLayout

    layout.forEach((tile) => {
      if(!tile['$elem']) {
        const img = document.createElement('img')
        img.src = tile.img
        tile['$elem'] = img

        if(!img.complete && !tile.listener) {
          img.addEventListener('load', () => {
            this._recomputeLayout()
          })
          tile.listener = true
        } else {
          this.ctx.drawImage(tile['$elem'], tile.x, tile.y);
        }
      } else {
        this.ctx.drawImage(tile['$elem'], tile.x, tile.y);
      }
    })
  }

  renderLayout() {
    //TODO use crs!!!
    const bounds = map_utils.calcBounds(this.lat, this.lng, this.zoom, this.width, this.height)

    const topLeftMeters = this.crs.projection.project({lng: bounds.left, lat: bounds.top})
    const bottomRightMeters = this.crs.projection.project({lng: bounds.right, lat: bounds.bottom})

    const layoutForBounds = {
        top: topLeftMeters.y,
        left: topLeftMeters.x,
        right: bottomRightMeters.x,
        bottom: bottomRightMeters.y
    }
    const subdomains = ['a', 'b', 'c']

    const tiles = this.tiler.getTiles(layoutForBounds, this.zoom);

    return tiles.reduce((prev, next) => {
      const subdomainIndex = Math.abs(next.X + next.Y) % subdomains.length;
      const subdomain = subdomains[subdomainIndex];

      return prev.set(`${next.Z}:${next.X}:${next.Y}`, {
          x: next.left,
          y: next.top,
          img: `http://${subdomain}.tile.osm.org/${next.Z}/${next.X}/${next.Y}.png`,
          '$elem': null,
          listener: false

      })
    }, new Map())
  }

  // @method getSize(): Point
	// Returns the current size of the map container (in pixels).
	getSize () {
    return new Point(this.width, this.height)
	}

  _getNewPixelOrigin(center, zoom) {
		const viewHalf = this.getSize()._divideBy(2);
		const projectedCenter = this.project(center, zoom)

    return projectedCenter._subtract(viewHalf) //._add(this._getMapPanePos())._round();
	}

  getPixelOrigin() {
    const {lat, lng, zoom} = this

    return this._getNewPixelOrigin({lat, lng}, zoom)
  }

  latLngToContainerPoint(latlng) {
    //TODO this should return point relative to container
	}

  containerPointToLatLng(point) {
    const origin = this.getPixelOrigin()

    return this.unproject(origin.add(point));
	}

  project(latlng, zoom) {
		zoom = zoom === undefined ? this.zoom : zoom;
		return this.crs.latLngToPoint(new LatLng(latlng), zoom);
	}

	// @method unproject(point: Point, zoom: Number): LatLng
	// Inverse of [`project`](#map-project).
	unproject(point, zoom) {
		zoom = zoom === undefined ? this.zoom : zoom;

		return this.crs.pointToLatLng(new Point(point), zoom);
	}
}

const map = new NanoMap({
  zoom: 10,
  lat: 50,
  lng: 19,
  mapSelector: 'map'
})
