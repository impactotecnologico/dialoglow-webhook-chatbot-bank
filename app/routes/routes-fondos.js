var express             = require('express');
var fondos              = require('../models/fondo');
var fondosController    = require('../controllers/fondoController');

const { WebhookClient } = require('dialogflow-fulfillment');

var routerFondos = express.Router();

var agent = undefined;

routerFondos.use(function(req, res, next) {
    
    agent = new WebhookClient({ request: req, response: res });
    /*
    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
    */

    next();
});
  
routerFondos.get('/', function(req, res) {
    res.json({ message: 'Interceptor de Fondos' });  
});

routerFondos.route('/inversion')

    .post(fondosController.processRequest)

    .get(function(req, res) {
        console.log(req.body);
        res.json({ message: 'Get no disponible. Gracias por usar el chatbot' });
    });

module.exports = routerFondos;