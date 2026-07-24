const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 900 } });
  const page = await browser.newPage();
  const BASE_URL = 'http://localhost:5173';

  console.log('Taking screenshot of Landing Page...');
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshots/1_landing_page.png', fullPage: true });

  console.log('Taking screenshot of Pricing...');
  await page.goto(BASE_URL + '/pricing', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshots/2_pricing_page.png', fullPage: true });

  console.log('Taking screenshot of Login Page...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshots/3_login_page.png' });

  console.log('Taking screenshot of Register Page...');
  await page.goto(BASE_URL + '/register', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshots/4_register_page.png' });

  console.log('Registering a temporary user...');
  
  // Try evaluating the inputs directly in browser context
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    if(inputs.length >= 3) {
       inputs[0].value = 'Test User';
       inputs[1].value = 'testuser_' + Date.now() + '@example.com';
       inputs[2].value = 'TestPassword123!';
    }
  });
  
  // Just click any button that has type submit
  await page.click('button[type=\"submit\"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.log('Navigation wait timed out'));
  await new Promise(r => setTimeout(r, 2000));

  console.log('Taking screenshot of Dashboard Page...');
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle2' }).catch(e => {});
  await page.screenshot({ path: 'screenshots/5_dashboard.png' });

  console.log('Taking screenshot of Kanban Board...');
  await page.goto(BASE_URL + '/kanban', { waitUntil: 'networkidle2' }).catch(e => {});
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/6_kanban_board.png' });

  await browser.close();
  console.log('All screenshots taken successfully!');
})();
