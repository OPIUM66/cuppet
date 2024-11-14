const fs = require('fs');
const path = require('path');


class Cookills {
    constructor() {
    }

    updateCookieStatus(cookie , saveTime) {
        let cookills;
        const cookillsPath = `./cookies-temp/cookills.json`
        try {
            cookills = JSON.parse(fs.readFileSync(cookillsPath));
            if (!cookills) {
                cookills = {};
            }
        } catch (error) {
            cookills = {}  
        }

        cookills.saveTime = saveTime;
        cookills.cookie = cookie;

        fs.writeFileSync(cookillsPath, JSON.stringify(cookills));

    }

    checkCookieExpiery(cookies) {
        const current = new Date().getTime();
        const expired = [];
        cookies.forEach(cookie => {
            if (cookie.expiry) {
                if (current <= cookie.expiry) {
                    expired.push(cookie);
                }
            }
        });

        return {
            expiry: expired,
            status: (expired.length <= 0) ? true : false,
        }
    }

    saveCookie(cookies) {
        const {expiry, status} = this.checkCookieExpiery(cookies);
        if (status) {
            this.saveObjectToFile(cookies);
        } else {
            console.log('💢 Expiered' , expiry);
        }
    }

    saveObjectToFile(obj) {
        const saveTime = new Date().getTime();
    const filePath = `./cookies-temp/cookie-${saveTime}.json`

     try {
        const dirPath = path.dirname(filePath);
        fs.mkdirSync(dirPath, { recursive: true }); 
        fs.writeFileSync(filePath, JSON.stringify(obj));
        this.updateCookieStatus(obj ,saveTime);

        console.log('✅ Cookies Saved' , filePath);

     } catch (error) {
        console.error('Error saving object:', error);
     }
    }

    
}

module.exports = Cookills;