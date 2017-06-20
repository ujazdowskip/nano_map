const MapTheTiles = function (projExtent,tileSize) {

  // default spherical mercator project extent (in meters)
  this.projExtent = projExtent || {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  };
  this.size = tileSize || 256;

  this._resolutions = []

  this.maxRes = Math.min(
    Math.abs(this.projExtent.right - this.projExtent.left) / 256,
    Math.abs(this.projExtent.top - this.projExtent.bottom) / 256);

  for (let zoom = 0; zoom <= 20; zoom++) {
    this._resolutions.push(this.maxRes / Math.pow(2, zoom))
  }
}

/*MapTheTiles.prototype.tileExtent = function(z, x, y) {
  const res = this._resolutions[z]

  const sizeXres = res * 256

  const minX = this.projExtent.left + x * sizeXres;
  const minY = this.projExtent.top + y * sizeXres;

  var maxX = minX + sizeXres;
  var maxY = minY + sizeXres;

  return [minX, minY, maxX, maxY]
}*/

MapTheTiles.prototype.getTileRangeForExtentAndResolution = function(extent, res) {
  const lx = (extent.left - this.projExtent.left) / res
  const rx = (extent.right - this.projExtent.left) / res
  const ty = (this.projExtent.top - extent.top ) / res
  const by = (this.projExtent.top - extent.bottom ) / res

  return {
    minX: Math.floor(lx / this.size),
    maxX: Math.ceil(rx / this.size),
    minY: Math.floor(ty / this.size),
    maxY: Math.ceil(by / this.size)
  }
}

MapTheTiles.prototype.getTiles = function(extent,zoom) {
  //const edgeTileCount = Math.pow(2, Math.floor(zoom))
  //console.log('EDGE TILE COUNT', edgeTileCount);
  //console.log('MAX RES', this.maxRes);

  //const res = this.maxRes / edgeTileCount;
  const res = this._resolutions[Math.floor(zoom)]

  const tileRange = this.getTileRangeForExtentAndResolution(extent, res)


  //coordinated in pixel
  console.log('extent', extent);
  const lx = (extent.left - this.projExtent.left) / res
  //const rx = (extent.right - this.projExtent.left) / res
  const ty = (this.projExtent.top - extent.top ) / res
  //const by = (this.projExtent.top - extent.bottom ) / res

  //console.log('ty', ty);

  //Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w))

  let left = (tileRange.minX * this.size) - lx
  let top = (tileRange.minY * this.size) - ty
  const topStart = (tileRange.minY * this.size) - ty


/*
  //almost working
  //  - arbitrary code (don't know why it works)
  //  - not accurate
  const toAdd = 146 * (this.size / 256 - 1)
  let top = (tY * this.size - ty) + toAdd
  const topStart = (tY * this.size - ty) + toAdd
  let left = (lX * this.size - lx) + toAdd
*/

  const tiles = []

  for (var i = tileRange.minX; i <= tileRange.maxX; i++) {

    top = topStart;

    for(var j = tileRange.minY; j <= tileRange.maxY; j++) {

      tiles.push({
        X:i,
        Y:j,
        Z:Math.floor(zoom),
        top: top,
        left: left
      });

      top += this.size;
    }

    left += this.size;
  }

  return tiles;
};

module.exports = MapTheTiles;
