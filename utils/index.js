const sleep = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.floor((Math.random() * 0.4 + 0.8) * ms))
  })
}

module.exports = {
  sleep
}
