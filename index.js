const Planet = require('./classes/planet')
const config = require('./config')
const Browser = require('./classes/browser')
const Research = require('./classes/research')
// const express = require('express')
// const bodyParser = require('body-parser')

const sleep = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

const app = async function () {
  const browser = new Browser(config.puppeteer)

  await browser.run()
  await browser.goTo('https://fr.ogame.gameforge.com/')

  const page = browser.getPage()

  await page.click('#ui-id-1')
  await page.type('#usernameLogin', config.account.username)
  await page.type('#passwordLogin', config.account.password)
  await page.click('#loginSubmit')

  await sleep(5000)

  await page.click('#joinGame > button')
  await sleep(2000)
  await browser.goTo(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=overview`)

  // LOAD AGO CONFIG
  await page.click('#ago_menubutton')
  await sleep(1500)
  await page.click('#ago_menu_Data')
  await sleep(1500)
  await page.type('#ago_menu_D9C', config.AGO.configString)
  await sleep(1500)
  await page.click('#ago_menu_button_D80')
  await sleep(1500)
  await page.click('#ago_menu_button_D9E')
  await sleep(1500)
  await page.click('#ago_menu_button_AM3')
  await sleep(1500)

  await page.evaluate(() => {
    localStorage.setItem('AGO_FR_UNI126_163847_SPY_TABLE_DATA', {'sortDesc': true, 'sortSequence': 'loot', 'checkedMessages': []})
  })
  await browser.goTo(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=overview`)

  const planetsId = await page.$$eval('span.planet-koords', els => {
    return els.map(item => {
      return item.parentNode.parentNode.id
    })
  })

  const researches = {
    energy: new Research('energy', 0, new Date()),
    lazer: new Research('lazer', 0, new Date()),
    ion: new Research('ion', 0, new Date()),
    hyperspace: new Research('hyperspace', 0, new Date()),
    plasma: new Research('plasma', 0, new Date()),
    combustionReactor: new Research('combustionReactor', 0, new Date()),
    impulsionReactor: new Research('impulsionReactor', 0, new Date()),
    hyperspacePropulsion: new Research('hyperspacePropulsion', 0, new Date()),
    spy: new Research('spy', 0, new Date()),
    computer: new Research('computer', 0, new Date()),
    astrophysics: new Research('astrophysics', 0, new Date()),
    intergalacticNetwork: new Research('intergalacticNetwork', 0, new Date()),
    graviton: new Research('graviton', 0, new Date()),
    weapons: new Research('weapons', 0, new Date()),
    shields: new Research('shields', 0, new Date()),
    structure: new Research('structure', 0, new Date())
  }
  const planets = {}

  for (let planet of planetsId) {
    planets[planet] = new Planet({ config: config.universe, researches, name: planet })
    await planets[planet].setCoordinates(page)
  }

  // const SinglePlanet = require('./scenarios/single-planet')
  // const InactiveRaid = require('./scenarios/inactive-raid')
  const scenarios = [
    // new SinglePlanet(planets, researches, {}),
    // new InactiveRaid(planets, researches, {})
  ]

  // let isRunning = false
  let isRunning = true
  setInterval(async () => {
    if (isRunning) {
      return
    }
    isRunning = true

    try {
      // Revalidate planets
      for (let name of Object.keys(planets)) {
        const planet = planets[name]
        await planet.autoRevalidate(page)
      }
      // Revalidate researches
      for (let name of Object.keys(researches)) {
        const research = researches[name]
        if (!research.isValid()) {
          await research.autoRevalidate(page)
        }
      }

      for (let scenario of scenarios) {
        if (scenario.isAppliable()) {
          await scenario.loop(page)
        }
      }
    } catch (e) {
      console.error('Loop failed', e)
    }
    isRunning = false
  }, 500)
}

app().then(() => {
  console.log('Ok')
}).catch(e => {
  console.error(e)
})
