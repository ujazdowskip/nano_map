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
    this.lat = opts.lat || 0
    this.lng = opts.lng || 0

    this.$map = document.getElementById(opts.mapSelector)
    this.ctx = this.$map.getContext("2d");
    this.width = this.$map.offsetWidth
    this.height = this.$map.offsetHeight
    this.offsetLeft = this.$map.offsetLeft
    this.offsetTop = this.$map.offsetTop

    var z = opts.zoom

    this.crs = new CRS({
      zoom: z
    })

    if (opts.onZoom) {
      opts.onZoom(z)
    }

    Object.defineProperty(this, 'zoom', {
      get() {
        return z
      },

      set(value) {
        //FIXME problem with center when zoom cros whole value
        const newTileSize = 256 + 256 * (value % 1)

        this.crs.tileSize = newTileSize
        z = value

        this._recomputeLayout()

        if (opts.onZoom) {
          opts.onZoom(value)
        }
      }
    });

    this._currentLayout = null

    this.init()
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
    const onScroll = this._onScroll.bind(this)

    $map.addEventListener('mousedown', (evt) => {

      this.currentClientXY = {
        x: evt.layerX,
        y: evt.layerY
      }

      //this.currentPixelCenter = this.getPixelOrigin()

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

    $map.addEventListener('wheel', onScroll)

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

  _onScroll(evt) {
    const val = evt.deltaY / 4 / 100

    this.zoom += val
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
    const tileSize = this.crs.tileSize

    this.ctx.strokeStyle = '#000'
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
          if(Math.floor(this.zoom) === tile.z) {
            this._drawTile(tile, tileSize)
          }
        }
      } else {
        if(Math.floor(this.zoom) === tile.z) {
          this._drawTile(tile, tileSize)
        }
      }
    })

    this.ctx.strokeStyle = '#F00'
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 2, 0);
    this.ctx.lineTo(this.width / 2, this.height);
    this.ctx.moveTo(0, this.height / 2);
    this.ctx.lineTo(this.width, this.height  / 2);
    this.ctx.stroke();

  }

  _drawTile(tile, size) {
    const {x, y} = tile

    this.ctx.drawImage(tile['$elem'], x, y, size, size);

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + size, y);
    this.ctx.lineTo(x + size, y + size);
    this.ctx.lineTo(x, y + size);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.ctx.font = '20px serif';
    this.ctx.fillText(tile.zxy, x + 20, y + size / 2)
  }

  renderLayout() {
    const bounds = this.getBounds()

    const topLeftMeters = this.crs.projection.project({lng: bounds.left, lat: bounds.top})
    const bottomRightMeters = this.crs.projection.project({lng: bounds.right, lat: bounds.bottom})

    const layoutForBounds = {
        top: topLeftMeters.y,
        left: topLeftMeters.x,
        right: bottomRightMeters.x,
        bottom: bottomRightMeters.y
    }
    const subdomains = ['a', 'b', 'c']

    const tiler = new MapTheTiles(null, this.crs.tileSize)
    const tiles = tiler.getTiles(layoutForBounds, this.zoom);

    return tiles.reduce((prev, next) => {
      const subdomainIndex = Math.abs(next.X + next.Y) % subdomains.length;
      const subdomain = subdomains[subdomainIndex];
      const z = Math.floor(next.Z)
      const mapKey = `${z}:${next.X}:${next.Y}`

      return prev.set(mapKey, {
          x: next.left,
          y: next.top,
          z: z,
          zxy: `${z}:${next.X}:${next.Y}`,
          img: `http://${subdomain}.tile.osm.org/${z}/${next.X}/${next.Y}.png`,
          '$elem': null,
          listener: false

      })
    }, new Map())
  }

  getBounds() {
    const {lat, lng, width, height} = this
    const centerPx = this.latLngToContainerPoint({lng, lat})

    const SWLatLng = this.containerPointToLatLng(centerPx.add({
      x: -width / 2,
      y: height / 2
    }))

    const NELatLng = this.containerPointToLatLng(centerPx.add({
      x: width / 2,
      y: -height / 2
    }))


    return {
      bounds: [SWLatLng.lng, SWLatLng.lat, NELatLng.lng, NELatLng.lat], // [w, s, e, n]
      bbox: SWLatLng.lng + ',' + SWLatLng.lat + ',' + NELatLng.lng + ',' + NELatLng.lat,
      top: NELatLng.lat,
      right: NELatLng.lng,
      bottom: SWLatLng.lat,
      left: SWLatLng.lng
    };
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
    const projectedPoint = this.project(latlng)
		return projectedPoint._subtract(this.getPixelOrigin())
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
  lat: 50.20408905576835,
  lng: 19.275099635124203,
  mapSelector: 'map',
  onZoom(zoom) {
    const $zoom = document.getElementById('current_zoom')
    $zoom.innerHTML = zoom;
  }
})
