class Task {
  constructor (app, name, priority, parametters) {
    this.app = app
    this.priority = priority
    this.name = name
    this.isRunning = false
    this.paused = false
    this.truePaused = false
    this.parametters = parametters
  }

  runTask () {
    throw new Error('You need to define a runTask method for', this.name, 'task.')
  }

  async restoreContext () {
    if (!this.context) {
      return
    }
    if (this.context.page) {
      await this.app.page.goTo(this.context.page)
    }
    if (this.context.planet) {
      await this.context.planet.forcePlanet(this.app.page)
    }
  }

  unPause () {
    this.paused = false
    this.truePaused = false
  }

  async pause () {
    this.paused = true
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (this.truePaused) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }

  async run () {
    this.isRunning = false
    if (this.paused) {
      await this.restoreContext()
      return this.unPause()
    }
    return this.runTask()
  }
}

module.exports = Task
