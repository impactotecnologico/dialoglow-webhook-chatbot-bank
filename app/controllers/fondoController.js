var mongoose    = require('mongoose');
var Fondo       = mongoose.model('Fondo');

var estables    = [,"estable","estabilidad","seguro","seguridad"];
var riesgosos   = ["riesgo","rentable","rentabilidad"];

exports.processRequest = function (req, res) {

    var intentGetFondos = 'I4-CantidadInversionInicial';

    var query = req.body.queryResult;
    var parameters = [];

    if (query.outputContexts.length > 0) {
        parameters = query.outputContexts[0].parameters;
    }

    var queryText = query.queryText;

    console.log("queryText: " + queryText);

    var intent = query.intent;
    console.log(`Intent ${JSON.stringify(intent)} recibido.`);

    if (intent.displayName == intentGetFondos) {


        var isEstable = estables.find(function(element) {
            return parameters.p_tipoRiesgo.indexOf(element) > -1;
        });

        var isRiesgo = riesgosos.find(function(element) {
            return parameters.p_tipoRiesgo.indexOf(element) > -1;
        });

        var busqueda = {};

        if (isEstable) {
            busqueda = {"detalles.nivelRiesgo": {"$lte":3} }
        } else if (isRiesgo) {
            busqueda = {"detalles.nivelRiesgo": {"$gte":4} }
        }

        var confirmacionPersonalizada = `Ok, veamos ${parameters.p_username}, tenemos que te interesan fondos ${parameters.p_tipoRiesgo} y quieres invertir inicialmente unos ${parameters.p_cantidad} euros. `;

        Fondo.find(busqueda, function (err, losFondos) {
            if (err) {
                console.log("error...>");
                throw err;
            }

            confirmacionPersonalizada += `\nLos fondos que encajan con tu solicitud son: \n`;

            losFondos.forEach(function(element) {
                confirmacionPersonalizada += element.fondo + ", "
            });


            res.json({
                fulfillmentText: confirmacionPersonalizada.slice(0, -2)
            });

        });

    } else {
        res.json({
            message: 'Post Recibido'
        });
    }
}

