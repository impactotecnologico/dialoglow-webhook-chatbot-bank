var express      = require('express');        // call express
var app          = express();                 // define our app using express
var bodyParser   = require('body-parser');
var routes       = require('./app/routes/routes');
var routesFondos = require('./app/routes/routes-fondos');

const { WebhookClient } = require('dialogflow-fulfillment');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8051; 

app.use('/', routes);
app.use('/fondos/', routesFondos);


app.listen(port);
console.log("Server started at " + port);