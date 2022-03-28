const config = require('../config')
const { sleep } = require('../utils')

const login = async (browser, firstLogin) => {
  let page = config.browser === 'selenoid' ? browser : await browser.newPage()

  await page.goto(`https://${firstLogin ? 'fr' : 'lobby'}.ogame.gameforge.com/`)

  if (firstLogin) {
    await page.click(config.selectors.loginTab)
    // await page.click('#ui-id-1')
    await page.type(config.selectors.loginEmailField, config.account.username)
    await page.type(config.selectors.loginPasswordField, config.account.password)
    await page.click(config.selectors.loginSubmit)
  }

  await sleep(5000)

  await page.click(config.selectors.joingame)
  await sleep(5000)

  if (!firstLogin) {
    return page
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
  const nPages = await browser.pages()
  return nPages[0]
}

module.exports = {
  login
}
