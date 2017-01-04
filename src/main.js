import map_utils from './map_utils'
import MapTheTiles from './map-the-tiles'


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
    const xDiff = this.currentClientXY.x - evt.clientX
    const yDiff = this.currentClientXY.y - evt.clientY

    //Update to our new coordinates
    this.currentClientXY.x = evt.clientX
    this.currentClientXY.y = evt.clientY

    const R = 6378137
    const lat = this.lat
    const lng = this.lng

    console.log((Math.pow(2, this.zoom)));


    const dn = xDiff * 10;
    const de = yDiff * 5;

    //Coordinate offsets in radians
    const dLat = de/R || 0;
    const dLng = dn/R || 0;

    //OffsetPosition, decimal degrees
    const latO = lat - dLat * 180/Math.PI;
    const lngO = lng + dLng * 180/Math.PI;

    this.lat = latO
    this.lng = lngO

    this._recomputeLayout()
  }

  _initEvents() {
    const $map = this.$map
    console.log({map: $map});


    const onMove = this._onMove.bind(this)

    $map.addEventListener('mousedown', (evt) => {

      this.currentClientXY = {
        x: evt.clientX,
        y: evt.clientY
      }

      evt.preventDefault()
      $map.addEventListener('mousemove', onMove)
    })

    $map.addEventListener('mouseup', () => {
      this.currentClientXY = {}
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
          console.log(tile.listener);
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

  degrees2meters(lon, lat) {
    const x = lon * 20037508.34 / 180;
    let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);

    y = y * 20037508.34 / 180;

    return [x, y];
  }

  meters2degress(x,y) {
    const lon = x *  180 / 20037508.34 ;
    const lat = Number(180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2));
    return [lon, lat]
  }

  renderLayout() {
    const bounds = map_utils.calcBounds(this.lat, this.lng, this.zoom, this.width, this.height)
    const topLeftMeters = this.degrees2meters(bounds.left, bounds.top)
    const bottomRightMeters = this.degrees2meters(bounds.right, bounds.bottom)

    const layoutForBounds = {
        top: topLeftMeters[1],
        left: topLeftMeters[0],
        right: bottomRightMeters[0],
        bottom: bottomRightMeters[1]
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
}

const map = new NanoMap({
  zoom: 10,
  lat: 50,
  lng: 19,
  mapSelector: 'map'
})
