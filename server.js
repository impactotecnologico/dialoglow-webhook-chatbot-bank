var express      = require('express');        // call express
var bodyParser   = require('body-parser');
var mongoose     = require('mongoose');
var config       = require('./app/config');
var routes       = require('./app/routes/routes');
var routesFondos = require('./app/routes/routes-fondos');

const { WebhookClient } = require('dialogflow-fulfillment');

var app          = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;



const options = {
    reconnectTries: Number.MAX_VALUE, 
    reconnectInterval: 500, 
    poolSize: 10, 
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, 
    socketTimeoutMS: 45000, 
    useNewUrlParser: true
  };

mongoose.connect(config.dbUrl, options).then(
    () => { console.log("Conectado"); },
    err => { console.log("Error conectando" , err); }
  );


var db = mongoose.connection;
db.on('error', console.error.bind(console, 'error connecting with mongodb database:'));

db.once('open', function() {
console.log('Connected to mongodb database');
});    

db.on('disconnected', function () {
    //Reconnect on timeout
    mongoose.connect(config.mongoUrl);
    db = mongoose.connection;
});  

var port = process.env.PORT || 8051; 

app.use('/', routes);
app.use('/fondos/', routesFondos);


app.listen(port);
console.log("Server started at " + port);