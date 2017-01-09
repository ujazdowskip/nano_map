function wrapNum(x, range, includeMax) {
	const max = range[1]
	const min = range[0]
	const d = max - min
  
	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
}

module.exports = {
  wrapNum
}
