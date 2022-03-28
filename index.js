const Planet = require('./classes/planet')
const config = require('./config')
const Research = require('./classes/research')
const express = require('express')
const bodyParser = require('body-parser')
const Browser = require(`./classes/browsers/${config.browser}`)
const ogame = require('./classes/ogame')
const { sleep } = require('./utils')

const main = async function () {
  const browser = new Browser(config.puppeteer)
  await browser.run()

  this.page = await ogame.login(browser, true)

  await sleep(5000)

  // await this.page.evaluate(() => {
  //   localStorage.setItem('AGO_FR_UNI126_163847_SPY_TABLE_DATA', '{"sortDesc": true, "sortSequence": "loot", "checkedMessages": []}')
  // })
  await sleep(1000)

  await this.page.click(config.selectors.homepage)
  // await this.page.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=ingame&compenent=overview`)
  await sleep(5000)

  const planetsId = await this.page.$$eval('span.planet-koords', els => {
    return els.map(item => {
      return item.parentNode.parentNode.id
    })
  })

  console.log(planetsId)

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
    await planets[planet].setCoordinates(this.page)
    await planets[planet].autoRevalidate(this.page)
  }

  const SinglePlanet = require('./scenarios/single-planet')
  // const InactiveRaid = require('./scenarios/inactive-raid')
  const WatchDog = require('./scenarios/watchdog')
  const scenarios = [
    new WatchDog(planets, researches, {}),
    new SinglePlanet(planets, researches, {}),
    // new InactiveRaid(planets, researches, {})
  ]

  const server = express()

  server.use(bodyParser.json())

  server.post('/scenario/:name', async (req, res, next) => {
    // TODO: Enable that one day
    // if (!['spy'].includes(req.params.name)) {
    //   return next(new Error('Unknown scenario'))
    // }
    const ScenarioClass = require(`./scenarios/${req.params.name}`)
    const scenario = new ScenarioClass(planets, researches, {})

    await this.page.close()
    this.page = await ogame.login(browser)
    await sleep(5000)
    scenario.action(this.page, req.body).then(data => {
      res.json(data)
    }).catch(e => {
      next(e)
    })
  })

  server.use((err, req, res, next) => {
    if (!err.status) {
      err.status = 400
    }
    res.status(err.status)
    res.json({ error: err.message })
    console.error(err.stack)
  })

  server.listen(4242, '127.0.0.1', () => {
    console.log('Listening on 127.0.0.1:4242')
  })

  let isRunning = false
  setInterval(async () => {
    if (isRunning) {
      return
    }
    isRunning = true

    try {
      for (let scenario of scenarios) {
        if (scenario.isAppliable()) {
          await scenario.loop(this.page)
        }
      }
    } catch (e) {
      console.error('Loop failed', e)
    }
    isRunning = false
  }, 500)
}

main().then(() => {
  console.log('Ok')
}).catch(e => {
  console.error(e)
})
