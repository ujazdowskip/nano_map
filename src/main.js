import map_utils from './map_utils'
import MapTheTiles from './map-the-tiles'

const $map = document.getElementById('map')
const width = $map.offsetWidth
const height = $map.offsetHeight
let zoom = 10
const latLng = {
  lat: 50,
  lng: 19
}

function degrees2meters(lon, lat) {
  const x = lon * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);

  y = y * 20037508.34 / 180;

  return [x, y];
}

const tiler = new MapTheTiles(null, 256);

class Map {
  constructor(opts) {
    this.zoom = opts.zoom || 10
    this.lat = opts.lat || 0
    this.lng = opts.lng || 0
    this.$map = document.getElementById(opts.mapSelector)
    this.width = $map.offsetWidth
    this.height = $map.offsetHeight
    this.tiler = new MapTheTiles(null, 256);

    this.init()
  }

  init() {
    const layout = this.renderTiles()

    console.log('LAYOUT', layout)
  }

  degrees2meters(lon, lat) {
    const x = lon * 20037508.34 / 180;
    let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);

    y = y * 20037508.34 / 180;

    return [x, y];
  }

  renderTiles() {
    const bounds = map_utils.calcBounds(latLng.lat, latLng.lng, zoom, width, height)
    const topLeftMeters = this.degrees2meters(bounds.left, bounds.top)
    const bottomRightMeters = this.degrees2meters(bounds.right, bounds.bottom)
    const layout = [];

    const layoutForBounds = {
        top: topLeftMeters[1],
        left: topLeftMeters[0],
        right: bottomRightMeters[0],
        bottom: bottomRightMeters[1]
    }

    const tiles = tiler.getTiles(layoutForBounds, zoom);

    tiles.forEach(function (tile) {
      const subdomains = ['a', 'b', 'c']

      const coordPoint = {
          x: tile.X,
          y: tile.Y,
          z: tile.Z
      }

      const subdomainIndex = Math.abs(coordPoint.x + coordPoint.y) % subdomains.length;
      const subdomain = subdomains[subdomainIndex];

      const coord = {
          x: tile.left,
          y: tile.top,
          //img: TileUtil.getTileUrl(options.tileSource, coordPoint, options.subdomains)
          img: `http://${subdomain}.tile.osm.org/${coordPoint.z}/${coordPoint.x}/${coordPoint.y}.png`
      };

      layout.push(coord);
    }, this);

    return layout;
  }
}

const map = new Map({
  zoom: 10,
  lat: 50,
  lng: 19,
  mapSelector: 'map'
})

console.log(map);

function renderTiles() {
  const bounds = map_utils.calcBounds(latLng.lat, latLng.lng, zoom, width, height)
  const topLeftMeters = degrees2meters(bounds.left, bounds.top)
  const bottomRightMeters = degrees2meters(bounds.right, bounds.bottom)
  const layout = [];

  const layoutForBounds = {
      top: topLeftMeters[1],
      left: topLeftMeters[0],
      right: bottomRightMeters[0],
      bottom: bottomRightMeters[1]
  }

  const tiles = tiler.getTiles(layoutForBounds, zoom);

  console.log(tiles);

  tiles.forEach(function (tile) {
    const subdomains = ['a', 'b', 'c']

    const coordPoint = {
        x: tile.X,
        y: tile.Y,
        z: tile.Z
    }

    const subdomainIndex = Math.abs(coordPoint.x + coordPoint.y) % subdomains.length;
    const subdomain = subdomains[subdomainIndex];

    const coord = {
        x: tile.left,
        y: tile.top,
        //img: TileUtil.getTileUrl(options.tileSource, coordPoint, options.subdomains)
        img: `http://${subdomain}.tile.osm.org/${coordPoint.z}/${coordPoint.x}/${coordPoint.y}.png`
    };

    layout.push(coord);
  }, this);

  return layout;
}

const $zoomin = document.querySelector('button[name="zoomin"]')
const $zoomout = document.querySelector('button[name="zoomout"]')

$zoomin.addEventListener('click', (evt) => {
  zoom += 1
  console.log(renderTiles());
})

$zoomout.addEventListener('click', (evt) => {
  zoom -= 1
  console.log(renderTiles());
})

//const tiles = renderTiles()


/*tiles.forEach((tile) => {
  const img = document.createElement('img')
  img.style.left = tile.x + 'px'
  img.style.top = tile.y + 'px'
  img.src = tile.img
  img.className = 'tile'

  $map.appendChild(img)
})*/
