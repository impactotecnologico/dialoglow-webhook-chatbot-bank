var mongoose    = require('mongoose');
var request     = require('request');
var Fondo       = mongoose.model('Fondo');

var estables    = ["modera","estable","estabilidad","seguro","seguridad"];
var riesgosos   = ["riesgo","rentable","rentabilidad"];

exports.processRequest = function (req, res) {

    var intentGetFondos = 'I4-CantidadInversionInicial';
    var intentDetalleFondos = 'I4-CantidadInversionInicialTodos - next';
    var intentDetalleUnFondo = 'I4-CantidadInversionInicial - UnFondo'; // TODO
    var intentCualMeRecomiendas = 'I4-TodosRecomendacion - custom';
    var intentRePregunta = "I4-RePregunta";
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

    } else if (intent.displayName == intentRePregunta) {       

        responseRePregunta(query, res);
        
    }else {
        res.json({
            message: 'Post Recibido'
        });
    }
}

function responseRePregunta(query, res){
    var parameters = getParameters(query);

    var busqueda = getTipoRiesgo(parameters);
    var confirmacionPersonalizada = "";


    var headers = {
        'Authorization':'Bearer 171e45c8f3214a7aa70056185a8cbf0b',
    }
    
   var options = {
        url: 'https://dialogflow.googleapis.com/v2beta1/7c272d7e-37c2-1337-0ae8-59bf9503d4d9:detectIntent',
        method: 'POST',
        headers: headers,
        json: {
            'followupEventInput':{
                "name": "repregunta",
                "parameters": {
                    'cantidad': parameters.p_cantidad
                },
                "languageCode": "es-ES"
              },
        }
    }

    console.log(JSON.stringify(options));
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log(body)
        } else {
            console.log("error------",error,"++++++++++++++",response,"55555555555555", body );
        }
    })



    /*

    var nombre = ""
    if (parameters.p_username != undefined){
        nombre = parameters.p_username + ", ";
    }

    if ( (Math.floor(Math.random()*(20-5+1))+5) % 2 == 0 ){
        confirmacionPersonalizada = `Si buscas un ${parameters.p_tipoRiesgo} para tu inversión de ${parameters.p_cantidad} euros... <br> `;
    } else {
        confirmacionPersonalizada = `Vale, para un ${parameters.p_tipoRiesgo} invirtiendo unos ${parameters.p_cantidad} euros... veamos... <br>`;
    }

    console.log("Busqueda: ", busqueda);

    Fondo.find(busqueda, function (err, losFondos) {
        if (err) {
            console.log("error...>");
            throw err;
        }
        confirmacionPersonalizada += `En este caso las opciones que tenemos son:`;
        var li = "<ul>";
        losFondos.forEach(function (element) {
            li += "<li>" + element.fondo + "</li>";
        });

        confirmacionPersonalizada += li + "</ul>";

        confirmacionPersonalizada += "¿De cuál te doy más detalle?<br>       " ;

        res.json({
            fulfillmentText: confirmacionPersonalizada
        });
    });

    */
    

}

function responseGetDetalleUnFondo (query, res) {
    var parameters = getParameters(query);

    var busqueda = { "fondo": parameters.p_unFondo };

    console.log("Busqueda: ", busqueda );

    Fondo.findOne(busqueda, function (err, elFondo) { 
        if (err) {
            console.log("error...>");
            throw err;
        }

        var informacionDetallada = "<strong>"+elFondo.fondo+"</strong>, buena elección! Para tu inversión de " + parameters.p_cantidad + " euros, es una buena opción. ";

        informacionDetallada += "Te comento el detalle de este fondo: <br>";

        informacionDetallada += "Tiene un nivel de riesgo " + elFondo.nivelRiesgo + " <br> ";

        informacionDetallada += "Una complejidad " + elFondo.complejidad + " <br> ";
        
        informacionDetallada += "La divisa de comercialización es el " + elFondo.divisa + " <br> ";

        informacionDetallada += "Sus índices son: " + elFondo.descripcion + " <br> ";
    
        res.json({
            fulfillmentText: informacionDetallada
        });
    });
}

function responseEmail (query, res) {

    console.log("Email: ", query );

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

    response += "<br>¿Hay algo más en lo que pueda ayudarte?<br>";

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

        informacionDetallada += "<strong>" + elFondo.fondo + "</strong>" + ". Te comento el detalle de este fondo: <br>";

        informacionDetallada += "Tiene un nivel de riesgo " + elFondo.nivelRiesgo + " <br> ";

        informacionDetallada += "Una complejidad " + elFondo.complejidad + " <br> ";
        
        informacionDetallada += "La divisa de comercialización es el " + elFondo.divisa + " <br> ";

        informacionDetallada += "Esa sería mi recomendación. <br>";
    
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

            informacionDetallada += "<strong>" + element.fondo + "</strong>" + "<br>";

            informacionDetallada += element.descripcion + " <br><br>  ";
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

    var nombre = ""
    if (parameters.p_username != undefined){
        nombre = parameters.p_username + ", ";
    }

    if ( (Math.floor(Math.random()*(20-5+1))+5) % 2 == 0 ){
        confirmacionPersonalizada = `Vale ${nombre}buscas un ${parameters.p_tipoRiesgo} y tienes pensado invertir ${parameters.p_cantidad} euros. `;
    } else {
        confirmacionPersonalizada = `Ok ${nombre}tenemos que te interesa un ${parameters.p_tipoRiesgo} y quieres invertir inicialmente unos ${parameters.p_cantidad} euros. `;
    }

    console.log("Busqueda: ", busqueda);

    Fondo.find(busqueda, function (err, losFondos) {
        if (err) {
            console.log("error...>");
            throw err;
        }
        confirmacionPersonalizada += `\nLos fondos que encajan con tu solicitud son:`;
        var li = "<ul>";
        losFondos.forEach(function (element) {
            li += "<li>" + element.fondo + "</li>";
        });

        confirmacionPersonalizada += li + "</ul>";

        confirmacionPersonalizada += "¿De cuál te informo?<br>       " ;

        res.json({
            fulfillmentText: confirmacionPersonalizada
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

    var contextos = query.outputContexts;

    console.log("contextos===" + contextos.length);

    for (var i= 0; i < contextos.length; i++) {

        console.log("indice: " + i, contextos[i]);

        if (contextos[i] != undefined) {
            parameters = contextos[i].parameters;

            if (parameters.hasOwnProperty("p_unFondo") ){
                if(parameters != undefined && 
                    (parameters.hasOwnProperty("p_cantidad") || parameters.hasOwnProperty("e_p_cantidad"))
                    &&
                    parameters.hasOwnProperty("p_unFondo") &&
                    parameters.hasOwnProperty("p_username") &&
                    parameters.hasOwnProperty("p_tipoRiesgo")     
                ){
                    break;
                }
            } else {
                if(parameters != undefined && 
                    (parameters.hasOwnProperty("p_cantidad") || parameters.hasOwnProperty("e_p_cantidad"))
                    &&
                    parameters.hasOwnProperty("p_username") &&
                    parameters.hasOwnProperty("p_tipoRiesgo")     
                ){
                    break;
                }
            }
        }
    }

    console.log("**** PARAMETROS ENCONTRADOS *****" , parameters);

    return parameters;
}
