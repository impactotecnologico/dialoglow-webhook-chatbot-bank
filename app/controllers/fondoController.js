var mongoose    = require('mongoose');
var Fondo       = mongoose.model('Fondo');

var estables    = ["modera","estable","estabilidad","seguro","seguridad"];
var riesgosos   = ["riesgo","rentable","rentabilidad"];

exports.processRequest = function (req, res) {

    var intentGetFondos = 'I4-CantidadInversionInicial';
    var intentDetalleFondos = 'I4-CantidadInversionInicialTodos - next';
    var intentDetalleUnFondo = 'I4-CantidadInversionInicial - UnFondo'; // TODO
    var intentCualMeRecomiendas = 'I4-TodosRecomendacion - custom';
    var intentGraciasAndEmail = 'I5-Gracias';

    var query = req.body.queryResult;

    var intent = query.intent;
    console.log(`Intent ${JSON.stringify(intent)} recibido.`);

    if (intent.displayName == intentGetFondos) {

        responseGetFondosByParameters(query, res);

    } else if (intent.displayName == intentDetalleFondos) {

        responseGetDetalleFondos(query, res);

    } else if (intent.displayName == intentDetalleUnFondo) {

        responseGetDetalleUnFondo(query, res);

    } else if (intent.displayName == intentCualMeRecomiendas) {        
        responseFondoRecomendadoAleatorio(query, res);

    } else if (intent.displayName == intentGraciasAndEmail) {       

        responseEmail(query, res);

    }else {
        res.json({
            message: 'Post Recibido'
        });
    }
}

function responseGetDetalleUnFondo (query, res) {
    var parameters = getParameters(query);

    var busqueda = { "fondo": parameters.p_unFondo };

    Fondo.findOne(busqueda, function (err, elFondo) { 
        if (err) {
            console.log("error...>");
            throw err;
        }

        console.log("*****************************************");
        console.log(elFondo);
        console.log("*****************************************");

        var informacionDetallada = "Buena elección!. Para tu inversión de " + parameters.p_cantidad + " euros, es una buena opción. ";

        informacionDetallada += "Te comento el detalle de este fondo: <br>";

        informacionDetallada += "Tiene un nivel de riesgo " + elFondo.nivelRiesgo + " <br> ";

        informacionDetallada += "Una complejidad " + elFondo.complejidad + " <br> ";
        
        informacionDetallada += "La divisa de comercialización es el " + elFondo.divisa + " <br> ";
    
        res.json({
            fulfillmentText: informacionDetallada
        });
    });
}

function responseEmail (query, res) {
    var parameters = getParameters(query);

    var response = "De acuerdo " + parameters.p_username + ". " ;

    if (parameters.p_email != undefined && (parameters.p_email.toUpperCase() !== "NO") || parameters.p_email.toUpperCase !== "NO GRACIAS"  ) {
        var palabrasRecibidas = parameters.p_email.split(' ');

        for (let i = 1; i < palabrasRecibidas.length; i++){
            if (validateEmail(palabrasRecibidas[i])) {
                response += "Te enviamos la información detallada para que puedas tomar la decisión que mejor te convenga. <br>";
                break;
            }
        }
        
    } else {
        response += "Igualmente quedamos a tu disposición para una próxima ocasión. ";
    }

    response += "<br>¿Hay algo más en lo que pueda ayudarte?";

    res.json({
        fulfillmentText: response
    });
}

function responseFondoRecomendadoAleatorio (query, res){

    var parameters = getParameters(query);

    var busqueda = getTipoRiesgo(parameters);

    Fondo.findOne(busqueda, function (err, elFondo) { 
        if (err) {
            console.log("error...>");
            throw err;
        }

        var informacionDetallada = "Ok, para tu inversión de " + parameters.p_cantidad + " euros, te recomiendo el fondo ";

        informacionDetallada += "<b>" + elFondo.fondo + "</b>" + ". Te comento el detalle de este fondo: <br>";

        informacionDetallada += "Tiene un nivel de riesgo " + elFondo.nivelRiesgo + " <br> ";

        informacionDetallada += "Una complejidad " + elFondo.complejidad + " <br> ";
        
        informacionDetallada += "La divisa de comercialización es el " + elFondo.divisa + " <br> ";

        informacionDetallada += "Esa sería mi recomendación.";
    
        res.json({
            fulfillmentText: informacionDetallada
        });
    });

}

function responseGetDetalleFondos(query, res) {
    var parameters = getParameters(query);

    var busqueda = getTipoRiesgo(parameters);
    var informacionDetallada = "Vale, te comento: <br>";
    Fondo.find(busqueda, function (err, losFondos) { 
        if (err) {
            console.log("error...>");
            throw err;
        }

        losFondos.forEach(function (element) {

            console.log(element);

            informacionDetallada += "<b>" + element.fondo + "</b>" + "<br>";

            informacionDetallada += element.descripcion + " <br> ";
        });
        res.json({
            fulfillmentText: informacionDetallada
        });
    });
}

function responseGetFondosByParameters(query, res) {
    var parameters = getParameters(query);

    var busqueda = getTipoRiesgo(parameters);
    var confirmacionPersonalizada = "";

    if ( (Math.floor(Math.random()*(20-5+1))+5) % 2 == 0 ){
        confirmacionPersonalizada = `Vale ${parameters.p_username}, buscas fondos de ${parameters.p_tipoRiesgo} y tienes pensado invertir ${parameters.p_cantidad} euros. `;
    } else {
        confirmacionPersonalizada = `Ok, veamos ${parameters.p_username}, tenemos que te interesan fondos de ${parameters.p_tipoRiesgo} y quieres invertir inicialmente unos ${parameters.p_cantidad} euros. `;
    }

    
    Fondo.find(busqueda, function (err, losFondos) {
        if (err) {
            console.log("error...>");
            throw err;
        }
        confirmacionPersonalizada += `\nLos fondos que encajan con tu solicitud son: \n`;
        losFondos.forEach(function (element) {
            confirmacionPersonalizada += element.fondo + ", ";
        });

        confirmacionPersonalizada = confirmacionPersonalizada.slice(0, -2);

        confirmacionPersonalizada += "<br>¿De cuál te informo?      " ;

        res.json({
            fulfillmentText: confirmacionPersonalizada.slice(0, -2)
        });
    });
}

function getTipoRiesgo(parameters) {
    var isEstable = estables.find(function (element) {
        return parameters.p_tipoRiesgo.indexOf(element) > -1;
    });
    var isRiesgo = riesgosos.find(function (element) {
        return parameters.p_tipoRiesgo.indexOf(element) > -1;
    });
    var busqueda = {};
    if (isEstable) {
        busqueda = { "nivelRiesgo": { "$lte": 3 } };
    }
    else if (isRiesgo) {
        busqueda = { "nivelRiesgo": { "$gte": 4 } };
    }
    return busqueda;
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getParameters(query){
    var parameters = [];

    for (var i= 0; query.outputContexts.length > 0; i++) {
        parameters = query.outputContexts[i].parameters;

        if(parameters.hasOwnProperty("p_cantidad") &&
            parameters.hasOwnProperty("p_unFondo") &&
            parameters.hasOwnProperty("p_username") &&
            parameters.hasOwnProperty("p_tipoRiesgo")     
        ){
            break;
        }
        parameters = query.outputContexts[2].parameters;
    }
}
