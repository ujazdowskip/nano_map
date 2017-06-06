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

  /*this.maxRes = Math.min(
    Math.abs(this.projExtent.right - this.projExtent.left) / this.size,
    Math.abs(this.projExtent.top - this.projExtent.bottom) / this.size);*/
  this.maxRes = Math.min(
    Math.abs(this.projExtent.right - this.projExtent.left) / 256,
    Math.abs(this.projExtent.top - this.projExtent.bottom) / 256);

  for (let zoom = 0; zoom <= 20; zoom++) {
    this._resolutions.push(this.maxRes / Math.pow(2, zoom))
  }


}

MapTheTiles.prototype.tileExtent = function(z, x, y) {
  const origin = [-20037508.342789244, 20037508.342789244]
  const res = this._resolutions[z]

  const sizeXres = res * 256

  const minX = origin[0] + x * sizeXres;
  const minY = origin[1] + y * sizeXres;

  var maxX = minX + sizeXres;
  var maxY = minY + sizeXres;

  return [minX, minY, maxX, maxY]
}

MapTheTiles.prototype.getTiles = function(extent,zoom) {
  //const edgeTileCount = Math.pow(2, Math.floor(zoom))
  //console.log('EDGE TILE COUNT', edgeTileCount);
  //console.log('MAX RES', this.maxRes);

  //const res = this.maxRes / edgeTileCount;
  const res = this._resolutions[Math.floor(zoom)]

  //console.log('res', res)

  console.log('resolutions', this._resolutions);


  //console.log('maxRes', this.maxRes)

  //console.log('SIZE', this.size)
  //console.log('RES', res)


  //coordinated in pixel
  /*const lx = Math.floor((extent.left - this.projExtent.left) / res)
  const rx = Math.floor((extent.right - this.projExtent.left) / res)
  const ty = Math.floor((this.projExtent.top - extent.top ) / res)
  const by = Math.floor((this.projExtent.top - extent.bottom ) / res)*/
  const lx = (extent.left - this.projExtent.left) / res
  const rx = (extent.right - this.projExtent.left) / res
  const ty = (this.projExtent.top - extent.top ) / res
  const by = (this.projExtent.top - extent.bottom ) / res

  //console.log('ty', ty);

  //Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w))


  const lX = Math.floor(lx/this.size) //left tile num
  const rX = Math.ceil(rx/this.size) //right tile num

  const tY = Math.floor(ty/this.size) //top tile num
  const bY = Math.ceil(by/this.size) //bottom tile num

  //top left tile position of top-left tile with respect to window/div

  /*console.log('EDGE TILE COUNT', edgeTileCount);
  console.log('MAX RES', this.maxRes);
  console.log('SIZE', this.size)
  console.log('RES', res)*/

  //console.log('SIZE', this.size);


  let left = (lX * this.size) - lx
  let top = (tY * this.size) - ty
  const topStart = (tY * this.size) - ty


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


  for (var i=lX; i<=rX; i++) {
    top = topStart;
    for(var j=tY; j<=bY; j++) {
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
