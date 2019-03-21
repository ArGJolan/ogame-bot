const Planet = require('./classes/planet')
const config = require('./config')
const Browser = require('./classes/browser')
const Research = require('./classes/research')
const express = require('express')
const bodyParser = require('body-parser')

const sleep = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, Math.floor((Math.random() * 0.4 + 0.8) * ms))
  })
}

const login = async (browser) => {
  let page = await browser.newPage()

  await page.goto('https://fr.ogame.gameforge.com/')

  await page.click('#ui-id-1')
  await page.type('#usernameLogin', config.account.username)
  await page.type('#passwordLogin', config.account.password)
  await page.click('#loginSubmit')

  await sleep(5000)

  await page.click('#joinGame > button')
  await sleep(5000)
  // await page.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=overview`)
  // await sleep(5000)

  const pages = await browser.pages()

  for (let cPage of pages) {
    if (cPage.url() !== `https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=overview&relogin=1`) {
      await cPage.close()
    } else {
      page = cPage
    }
  }

  // LOAD AGO CONFIG
  try {
    // throw new Error('XD')
    await page.click('#ago_menubutton')
    await sleep(1500)
    await page.click('#ago_menu_Data')
    await sleep(1500)
    // await page.type('#ago_menu_D9C', config.AGO.configString, { delay: 0 })
    await page.$eval('#ago_menu_D9C', (el, args) => {
      el.value = args[0]
      // return args
    }, [config.AGO.configString])
    await sleep(1500)
    await page.click('#ago_menu_button_D80')
    await sleep(1500)
    await page.click('#ago_menu_button_D9E')
    await sleep(1500)
  } catch (e) {
    console.error('Could not load AGO config', e)
  }
  return page
}

const app = async function () {
  const browser = new Browser(config.puppeteer)
  await browser.run()

  this.page = await login(browser)

  await this.page.evaluate(() => {
    localStorage.setItem('AGO_FR_UNI126_163847_SPY_TABLE_DATA', '{"sortDesc": true, "sortSequence": "loot", "checkedMessages": []}')
  })
  await sleep(1000)
  await this.page.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=overview`)
  await sleep(5000)

  const planetsId = await this.page.$$eval('span.planet-koords', els => {
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
    await planets[planet].setCoordinates(this.page)
  }

  // const SinglePlanet = require('./scenarios/single-planet')
  // const InactiveRaid = require('./scenarios/inactive-raid')
  const WatchDog = require('./scenarios/watchdog')
  const scenarios = [
    new WatchDog(planets, researches, {})
    // new SinglePlanet(planets, researches, {}),
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
    this.page = await login(browser)
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
      /**
       * TMP COMMENT
       * UNCOMMENT WHEN EVERYTHING IS IN A DB AND WE CAN IMPORT AT STARTUP
       */
      // Revalidate planets
      // for (let name of Object.keys(planets)) {
      //   const planet = planets[name]
      //   await planet.autoRevalidate(this.page)
      // }
      // // Revalidate researches
      // for (let name of Object.keys(researches)) {
      //   const research = researches[name]
      //   if (!research.isValid()) {
      //     await research.autoRevalidate(this.page)
      //   }
      // }

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

app().then(() => {
  console.log('Ok')
}).catch(e => {
  console.error(e)
})
