const fs = require('fs');
const path = require('path');

class History {
    history = {
        tip: "this is all your account history store only for you",
        sent: [],
        data: [],
    };
    constructor() {
        this.init();
    }
    async init() {

        const filePath = `./history-temp/history.json`;
        this.filePath = filePath;
        try {
            if (fs.existsSync(filePath)) {
                const history = fs.readFileSync(filePath);
                this.history = JSON.parse(history);
            } else {
                const dirPath = path.dirname(filePath);
                fs.mkdirSync(dirPath, { recursive: true }); 
                fs.writeFileSync(filePath, JSON.stringify(this.history, null, 4));
            }
            console.log('🆗 Hisory Registerd', filePath);

        } catch (error) {
            console.log('💤 Failed load history', error);
        }
    }


    async save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.history, null, 4));
            console.log('🆗 Hisory Updated', this.filePath);

        } catch (error) {
            console.log('💤 Failed save history', error);
        }

    }

    setSetStatus(id) {
        this.history.sent.push(id) 
    }

    setProjectData(data) {
        this.history.data.push(data) 

    }
}

module.exports = History;