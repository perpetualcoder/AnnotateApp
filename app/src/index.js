const express = require('express');
const https = require('https');
const fs = require('fs');

var key = fs.readFileSync('certs/selfsigned.key');
var cert = fs.readFileSync('certs/selfsigned.crt');
var options = {
  key: key,
  cert: cert
};

const port = 443;
const app = express();
const db = require('./persistence');
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(require('body-parser').json());
app.use(express.static(__dirname + '/static'));

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

var server = https.createServer(options, app);


db.init().then(() => {
    server.listen(port, () => console.log('Listening on port ', port));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
