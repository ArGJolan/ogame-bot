module.exports = {
  selectors: {
    homepage: '#menuTable > li:nth-child(1) > a',
    acceptCookies: '.cookiebanner4 .cookiebanner5:nth-child(2)',
    loginTab: '#loginRegisterTabs.tabs ul.tabsList li:nth-child(1) span',
    registerTab: '#loginRegisterTabs.tabs ul.tabsList li:nth-child(2) span',
    loginEmailField: '#loginForm input[name=email]',
    loginPasswordField: '#loginForm input[name=password]',
    loginSubmit: '#loginForm button[type=submit]',
    joingame: '#joinGame > button',
  },
  browser: 'selenoid',
  universe: {
    speed: 7,
    metalRatio: 1,
    crystalRatio: 1,
    deuteriumRatio: 1
  },
  account: {
    username: '',
    password: '',
    server: 126,
    hasAdmiral: true,
    hasCommanding: true
  },
  scenario: {
    spy: {
      systemRange: 5,
      probesLimit: 1089
    }
  },
  puppeteer: {
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1007
    }
  },
  AGO: {
    configString: ''
  },
  notifier: {
    pushbullet: {
      url: 'https://api.pushbullet.com/v2/pushes',
      method: 'POST'
    }
  }
}
