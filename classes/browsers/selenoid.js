const { remote } = require('webdriverio');
const path = require('path');
const { sleep } = require('../../utils');
const fs = require('fs')

const extension = fs.readFileSync('antigamereborn-7.2.1-an+fx.xpi')


const options = { 
    hostname: 'localhost',
    port: 4444,
    path: '/wd/hub',
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

  async $ (selector) {
    let element = null

    while (!element || element.error) {
      element = await this.browser.$(selector)

      console.log(element)

      if (element.error) {
        console.log('COULD NOT FIND ELEMENT', element.error)
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
    console.error('$eval is not implemented, called with', ...arguments)
    // TODO
  }

  async $$eval (selector, callback) {
  console.error('$$eval is not implemented, called with', ...arguments)
    // TODO
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
}

module.exports = Browser
