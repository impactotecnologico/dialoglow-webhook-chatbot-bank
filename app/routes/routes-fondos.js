var express = require('express');

const { WebhookClient } = require('dialogflow-fulfillment');

var routerFondos = express.Router();

var agent = undefined;

routerFondos.use(function(req, res, next) {
    
    agent = new WebhookClient({ request: req, response: res });
    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(req.body));

    next();
});
  
routerFondos.get('/', function(req, res) {
    res.json({ message: 'Interceptor de Fondos' });  
});

routerFondos.route('/inversion')

    .post(function(req, res) {

        var intentGetFondos = 'I4-CantidadInversionInicial';

        var query = req.body.queryResult;
        var parameters = [];

        console.log("context");
        console.log(query.outputContexts);

        console.log("context length");
        console.log(query.outputContexts.length);


        console.log("context el cero");
        console.log(query.outputContexts[0]);


        console.log("context parama");
        console.log(query.outputContexts[0].parameters);
        
        if (query.outputContexts.length > 0){
            parameters = query.outputContexts[0].parameters;
        }
        
        var queryText = query.queryText;

        console.log("queryText: " + queryText);

        var intent = query.intent;
        console.log(`Intent ${JSON.stringify(intent)} recibido: `);

        if (intent.displayName == intentGetFondos){

            var confirmacionPersonalizada = `Ok, veamos ${parameters.p_username}, tenemos que te interesan ${parameters.p_tipoRiesgo} y quieres invertir inicialmente unos ${parameters.p_cantidad} euros. `;

            
            res.json({ fulfillmentText: confirmacionPersonalizada });
        } else {
            res.json({ message: 'Post Recibido' });
        }
    })

    .get(function(req, res) {
        console.log(req.body);
        res.json({ message: 'Get recibido' });
    });

module.exports = routerFondos;