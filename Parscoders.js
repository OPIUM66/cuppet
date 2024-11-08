const { Builder, By, until } = require('selenium-webdriver');
const Cookills = require('./Cookills');
const fs = require('fs');
const Cuppet = require('./Cuppet');
const { HOME_URL, LOGIN_URL, DASHBOARD_URL, PROJECT_URL, DOMAIN_URL } = require('./config');
const History = require('./History');
const { env } = require('process');

class ParsCodersScrapper {
    async init() {
        this.driver = await new Builder().forBrowser('chrome').build({ cache: true });
        this.cookills = new Cookills();
        this.cuppet = new Cuppet(this.driver);
        this.history = new History();
    }


    async autoBid() {
        const projects = await this.extractProjects();

        console.log('🤖 Auto apply started for ', projects.length);

        for (const project of projects) {
            await this.sendBid(project.projectID);
        }

        await this.history.save();

    }
    async sendBid(projectID, meta = {}) {

        if (this.history.history.sent.includes(projectID)) {
            console.log('💫 Sent Before', projectID);
            return false;
        }

        let sessionCookie;
        if (this.lastCookies) {
            sessionCookie = this.lastCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        } else {
            console.log('💢 Unable to find cookies', this.lastCookies);
            return
        }

        const data = {
            bidAmount: meta.bidAmount ? meta.bidAmount : "",
            deadline: meta.deadline ? meta.deadline : "15",
            initEscrowPercent: meta.initEscrowPercent ? meta.initEscrowPercent : "100",
            expertGuaranteePercent: meta.expertGuaranteePercent ? meta.expertGuaranteePercent : "0",
            validDays: meta.validDays ? meta.validDays : "",
            message: meta.message ? meta.message : "<p>سلام</p>",
            "files[]": meta.files ? meta.files : {},
            "project-id": projectID,
        };

        try {
            const result = await fetch(`https://parscoders.com/conversation/ajax/bid-send?id=${projectID}`, {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    "cookie": sessionCookie,
                    "Referer": `${PROJECT_URL}/${projectID}`,
                    "Referrer-Policy": "origin-when-cross-origin"
                },
                "body": JSON.stringify(data),
                "method": "POST"
            });
            this.history.setSetStatus(projectID);

            console.log(`🔰 Bid sent to project ${projectID}`);
            return result
        } catch (error) {
            console.log('ERROR', error.error);
            console.error(`💥 Error sending bid to project ${projectID}:`, error.response?.data || error.message);
        }
    }
    async extractProjects(PROJECT_PAGE = PROJECT_URL) {
        const cacheCookies = await this.cacheLogin();
        await this.startFromCookie(cacheCookies, PROJECT_PAGE);

        await this.driver.wait(until.elementLocated(By.css('.project-list-item')), 10000);

        const projectElements = await this.driver.findElements(By.css('.project-list-item'));

        const projects = [];

        for (const projectElement of projectElements) {
            try {
                // Extract Project ID
                const projectIdAttr = await projectElement.getAttribute('id');
                const projectID = projectIdAttr.match(/project_(\d+)_row/)[1];

                // Extract Project Title
                const titleElement = await projectElement.findElement(By.css('.project--link'));
                const title = await titleElement.getText();

                // Extract Project Description
                const descriptionElement = await projectElement.findElement(By.css('.project-text'));
                const description = await descriptionElement.getText();

                // Extract Budget
                const budgetElement = await projectElement.findElement(By.css('.font-small-3:nth-child(2)'));
                const budget = (await budgetElement.getText()).replace('حداکثر بودجه:', '').trim();

                // Extract Time Posted
                const timePostedElement = await projectElement.findElement(By.css('.fa-calendar-alt')).findElement(By.xpath('..'));
                const timePosted = await timePostedElement.getText();

                // Extract Skills
                const skillsElements = await projectElement.findElements(By.css('.skill--item'));
                const skills = [];
                for (const skillElement of skillsElements) {
                    const skillText = await skillElement.getText();
                    if (skillText && skillText != '') {
                        skills.push(skillText);
                    }
                }

                const bookmarkLinkElement = await projectElement.findElement(By.css('.toggleBookmark'));
                const archiveLinkElement = await projectElement.findElement(By.css('.toggleArchive'));
                const bookmarkLink = await bookmarkLinkElement.getAttribute('href');
                const archiveLink = await archiveLinkElement.getAttribute('href');


                const projectData = {
                    projectID,
                    title,
                    description,
                    budget,
                    timePosted,
                    skills,
                    bookmarkLink,
                    archiveLink
                };

                this.history.setProjectData(projectData);

                projects.push(projectData);

            } catch (error) {
                console.error("Error extracting project data:", error);
            }
        }
        await this.history.save();
        console.log('💠 PROJECTS', projects.length);

        return projects;
    }
    async cacheDashboard() {
        const cacheCookies = await this.cacheLogin();
        const startCookie = await this.startFromCookie(cacheCookies);
    }
    async cacheLogin() {
        const cookillsPath = `./cookies-temp/cookills.json`

        try {
            const cookillsFile = fs.readFileSync(cookillsPath);
            const cookies = JSON.parse(cookillsFile).cookie;
            this.cookills.checkCookieExpiery(cookies);

            const { expiry, status } = this.cookills.checkCookieExpiery(cookies);
            if (status) {
                this.lastCookies = cookies;
                console.log('✅ Cookies Cached And Ready', status);
                return cookies;
            } else {
                console.log('💢 Cache Miss, cookies expiered trying again...', expiry);
                this.loginAndSaveCookie();
                await this.cacheLogin();

            }


        } catch (error) {
            console.log('💤 Cache Miss, trying again...');
            await this.loginAndSaveCookie();
            await this.cacheLogin();
        }


    }
    async loginAndSaveCookie() {
        this.cookies = await this.loginAndGetCookie();
        this.cookills.saveCookie(this.cookies);
        console.log('✅ Login And Saved ', this.cookies.length);

    }
    async loginAndGetCookie() {
        try {

            await this.driver.get(LOGIN_URL);
            const usernameInput = await this.driver.findElement(By
                .id('username'));
            const passwordInput = await this.driver.findElement(By
                .id('password'));

            await usernameInput.sendKeys(env.USERNAME);
            await passwordInput.sendKeys(env.PASSWORD);

            await this.driver.sleep(2000);

            const submitButton = await this.driver.findElement(By
                .css('button[type="submit"]'));
            await submitButton.click();

            await this.driver.sleep(1000);

            let cookies = await this.driver.manage().getCookies();

            this.lastCookies = cookies;
            return cookies;

        } catch (e) {
            console.error("An error occurred during login:", e
            );
            throw e;
        } finally {
            // await this.driver.quit();
        }
    };
    async startFromCookie(cookies, to = DASHBOARD_URL) {

        try {
            await this.driver.get(HOME_URL);

            if (!cookies) {
                console.log('💨 Get cookies in page again, think already logged-in');

                cookies = await this.driver.manage().getCookies();
            }


            for (let cookie of cookies) {
                await this.driver.manage().addCookie(cookie);
            }
            console.log("*️⃣ Dashboard loaded with existing session cookies.");

            return await this.driver.get(to);


        } catch (e) {
            console.error("💥 An error occurred while starting from cookies:", e);
            throw e;
        } finally {
            // await this.driver.quit();
        }
    }

}



module.exports = ParsCodersScrapper;

