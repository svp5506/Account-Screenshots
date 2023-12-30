const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the FedEx login page
    await page.goto('https://www.fedex.com/secure-login/en-us/#/login-credentials');

    // Fill in the password field
    await page.type('#password', 'your_password');

    // Click the checkbox to toggle password visibility (optional)
    await page.click('#toggle-password');

    // Other fields and interactions...

    // Click the login button using its id
    await page.click('#login-btn');

    // Wait for navigation to complete and for a specific element on the next page to be visible
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.waitForSelector('#some-element-on-next-page', { visible: true });

    // Now you are logged in, and you can proceed with further actions

    // Example: Take a screenshot
    await page.screenshot({ path: 'fedex_logged_in.png' });
  } catch (error) {
    console.error('Error during login:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
