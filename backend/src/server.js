const app = require('./app');
const config = require('./config/config');

const logger = require('./config/logger');

app.listen(config.port, (err) => {
    if(err){
        console.log(err);
        console.log("Error starting the server");
    }

    logger.info("Server connected successfully");

});