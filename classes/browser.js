const puppeteer = require('puppeteer')
const path = require('path')

class Browser {
  constructor (config) {
    this.config = config
  }

  async run () {
    const AGOPath = path.resolve('./AntiGameReborn')

    this.browser = await puppeteer.launch({
      ...this.config,
      args: [
        `--disable-extensions-except=${AGOPath}`,
        `--load-extension=${AGOPath}`,
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36'
      ],
      headless: false
    })
    this.page = await this.browser.newPage()
  }

  async pages () {
    return this.browser.pages()
  }

  async newPage () {
    this.page = await this.browser.newPage()
    return this.page
  }

  getPage () {
    return this.page
  }

  async goTo (url) {
    if (url) {
      const page = await this.page.goto(url)
      return page
    }
    throw new Error('No url provided')
  }

  async setCookie (cookies) {
    await this.page.setCookie(...cookies)
    await this.page.reload()
    return this.page
  }

  async getScreenshot () {
    const outputPath = path.resolve(path.join(__dirname, '/screenshot.png'))
    return this.page.screenshot({ path: outputPath })
  }

  async getCookies () {
    return this.page.cookies()
  }
}

module.exports = Browser
