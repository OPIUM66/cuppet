const fs = require('fs');
const { LOGIN_URL } = require('./config');

class Cuppet {
    constructor(driver) {
        this.driver = driver;
    }

    async cacheLoginPage() {
        await this.cachePageAsMHTML(LOGIN_URL);
    }

    async cachePageAsMHTML(url) {
        
        try {
          await this.driver.get(url);
          await this.driver.sleep(2000); 
      
          const mhtml = await this.driver.executeScript(`
            return new Promise((resolve) => {
              const { Page } = window.chrome.devtools;
              Page.captureSnapshot({ format: 'mhtml' }, (snapshot) => {
                resolve(snapshot);
              });
            });
          `);
      
          fs.writeFileSync('cached_page.mhtml', mhtml);
          console.log("Page cached as MHTML file.");
      
        } catch (e) {
          console.error("An error occurred while caching the page:", e);
        } finally {
        }
      }
      
      async loadCachedMHTML() {
        
        try {
          await this.driver.get(`file://${__dirname}/cached_page.mhtml`);
          console.log("Loaded cached MHTML page.");
        } catch (e) {
          console.error("An error occurred while loading the cached page:", e);
        } finally {
        }
      }
      
}

module.exports = Cuppet