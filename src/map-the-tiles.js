const MapTheTiles = function (projExtent,tileSize) {
  // default spherical mercator project extent
  this.projExtent = projExtent || {
    left: -20037508.342789244,
    right: 20037508.342789244,
    bottom: -20037508.342789244,
    top: 20037508.342789244
  };
  this.size = tileSize || 256;

  this.maxRes = Math.min(
    Math.abs(this.projExtent.right - this.projExtent.left)/this.size,
    Math.abs(this.projExtent.top - this.projExtent.bottom)/this.size);
}

MapTheTiles.prototype.getTiles = function(extent,zoom) {
  const edgeTileCount = Math.pow(2,Math.floor(zoom))
  const res = this.maxRes/edgeTileCount

  //coordinated in pixel
  const lx = Math.floor((extent.left - this.projExtent.left)/res)
  const rx = Math.floor((extent.right - this.projExtent.left)/res)
  const by = Math.floor((this.projExtent.top - extent.bottom )/res)
  const ty = Math.floor((this.projExtent.top - extent.top )/res)


  const lX = Math.floor(lx/this.size) //left tile num
  const rX = Math.ceil(rx/this.size) //right tile num
  const tY = Math.floor(ty/this.size) //top tile num
  const bY = Math.ceil(by/this.size) //bottom tile num

  //top left tile position of top-left tile with respect to window/div
  let top = (tY * this.size) - ty
  const topStart = (tY * this.size) - ty
  let left = (lX * this.size) - lx
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
