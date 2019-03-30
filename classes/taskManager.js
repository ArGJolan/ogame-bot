class TaskManager {
  constructor () {
    this.tasks = []
  }

  push (task) {
    const index = this.task.find(item => item.priority < task) || this.task.length
    this.tasks.splice(index, 0, task)
  }

  run () {
    let running = false
    setInterval(async () => {
      if (!this.tasks.length || this.tasks[0].isRunning || running) {
        return
      }
      running = true

      const index = this.tasks.find(task => task.isRunning)
      await this.tasks[index].pause()
      try {
        await this.tasks[0].run()
      } catch (e) {}
      running = false
    }, 50)
  }
}

module.exports = TaskManager
