const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');
const cliProgress = require('cli-progress');

async function getUserCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Enter your username: ', (username) => {
      rl.question('Enter your password: ', (password) => {
        rl.close();
        process.stdout.write('\u001b[2F\u001b[J'); // Clear console (may not work in all environments)
          resolve({ username, password });
      });
    });
  });
}

async function run() {
  puppeteer.use(stealthPlugin());

  const browser = await puppeteer.launch({ headless: "new" });
  const progressBar = new cliProgress.SingleBar(
    {
      format: ' {bar} {percentage}% | ETA: {eta}s',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
      stopOnComplete: true,
      barsize: 27,
    },
    cliProgress.Presets.shades_classic
  );

  try {
    const { username, password } = await getUserCredentials();
    const page = await browser.newPage();

    progressBar.start(9, 0);

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1200, height: 0 });

    await page.goto('https://www.spectrum.net', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.kite-button--primary', { visible: true });
    await page.click('.kite-button--primary');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#create-username', { visible: true });
    await page.type('#cc-username', username);
    await page.type('#cc-user-password', password);
    await page.waitForTimeout(2000);
    await page.click('.kite-button--primary');
    await page.waitForSelector('#billing-core-card-heading', { visible: true, timeout: 5000 });
    await page.waitForTimeout(2000);

    await captureScreenshot(page, 'Screenshots/Homepage.png');
    progressBar.increment();
    
    await page.goto('https://www.spectrum.net/billing', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#payment-amount', { visible: true, timeout: 5000 });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'Screenshots/Billing/BillingPage.png');
    progressBar.increment();

    await page.goto('https://www.spectrum.net/billing/payment-methods', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'Screenshots/Billing/BillingPagePaymentMethods.png');
    progressBar.increment();

    await page.goto('https://www.spectrum.net/services/internet', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await captureScreenshot(page, 'Screenshots/Services/ServicesPageInternet.png');
    progressBar.increment();

    await page.click('button[id="kite-tab-label-10"]');
    await page.waitForTimeout(1000);
    await captureScreenshot(page, 'Screenshots/Services/ServicesPageHomePhone.png');
    progressBar.increment();

    await page.click('button[id="kite-tab-label-12"]');
    await page.waitForTimeout(1000);
    await captureScreenshot(page, 'Screenshots/Services/ServicesPageTV.png');
    progressBar.increment();

    await page.click('button[id="kite-tab-label-13"]');
    await page.waitForSelector('.page-section', { visible: true, timeout: 5000 });
    await page.waitForTimeout(1000);
    await captureScreenshot(page, 'Screenshots/Services/ServicesPageMobile.png');
    progressBar.increment();

    await page.goto('https://www.spectrum.net/change', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#Storefront_Page', { visible: true, timeout: 5000 });
    await page.waitForTimeout(1000);
    await captureScreenshot(page, 'Screenshots/Upgrades.png');
    progressBar.increment();

    await page.goto('https://www.spectrum.net/support', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#main-container', { visible: true, timeout: 5000 });
    await page.waitForTimeout(1000);
    await captureScreenshot(page, 'Screenshots/SupportHome.png');
    progressBar.increment();

    progressBar.stop();
    console.log('Screenshots taken successfully.');
  } catch (error) {
    console.error('Unable to retrieve screenshots', error);
  } finally {
    await browser.close();
  }
}

async function captureScreenshot(page, path) {
  await page.screenshot({ path, fullPage: true });
}

run();
