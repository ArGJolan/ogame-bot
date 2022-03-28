const { remote } = require('webdriverio');
const path = require('path');
const { sleep } = require('../../utils');
const fs = require('fs')
const config = require('../../config')

const extension = fs.readFileSync('antigamereborn-7.2.1-an+fx.xpi')


const options = { 
    hostname: 'localhost',
    port: 4444,
    path: '/wd/hub',
    logLevel: 'warn',
    capabilities: {
        browserName: 'firefox', 
        browserVersion: '98.0',
        'selenoid:options': {
            enableVNC: true,
            enableVideo: false 
        }
    } 
};

class Browser {
  constructor (config) {
    this.config = { ...options, ...config }
  }

  async run () {
    this.browser = await remote(options);
    await this.browser.installAddOn(extension.toString('base64'), false);
  }

  async goto (url) {
    return this.browser.url(url)
  }

  async switchWindow (matcher) {
    await this.browser.switchWindow(matcher)
    return this
  }

  async $ (selector) {
    let element = null

    while (!element || element.error) {
      element = await this.browser.$(selector)
      if (element.error) {
        console.error('COULD NOT FIND ELEMENT', element.error)
        await sleep(1000)
      }
    }
    return element
  }

  async click (selector) {
    const element = await this.$(selector)
    return element.click()
  }

  async type (selector, content) {
    const element = await this.$(selector)
    return element.addValue(content)
  }

  async $eval (selector, callback) {
    const finalCallback = Function(`const callback = ${callback.toString()}; const el = document.querySelector('${selector}'); return callback(el);`)

    return this.browser.execute(finalCallback)
  }

  async $$eval (selector, callback) {
    const finalCallback = Function(`const callback = ${callback.toString()}; const els = document.querySelectorAll('${selector}'); const elements = []; for (const el of els) { elements.push(el) }; return callback(elements);`)

    return this.browser.execute(finalCallback)
  }

  async evaluate (callback) {
    console.error('evaluate is not implemented, called with', ...arguments)
    // TODO
  }

  async close (callback) {
    console.error('close is not implemented, called with', ...arguments)
    // TODO
  }

  async goTo (url) {
    console.error('goTo is not implemented, called with', ...arguments)
    // TODO
  }

  async navigate (planet, page, component) {
    if (this.planet !== planet || this.page !== page || this.component !== component) {
      this.planet = planet
      this.page = page
      this.component = component
      console.log(`Navigating to https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=${page}&cp=${planet.split('-')[1]}${component ? `&component=${component}` : ''}`)
      return this.browser.url(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=${page}&cp=${planet.split('-')[1]}${component ? `&component=${component}` : ''}`)
    }
    console.log(`Already at https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=${page}&cp=${planet.split('-')[1]}${component ? `&component=${component}` : ''}`)
  }
}

module.exports = Browser
