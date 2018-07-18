var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Detalle = new Schema({
    divisa:{
      type:String,
      required:false
    },
    comercializacion:{
      type:Date,
      required:false
    },
    activo:{
        type:Boolean,
        required:false
    },
    riesgo:{
        type:String,
        required:false
    },
    nivelRiesgo:{
        type:Number,
        required:false
    },
    complejidad:{
        type:Number,
        required:false
    }
});

var Fondo = new Schema({
fondo:{
    type:String,
    required:false,
    index: {unique: true}
},
detalles:{
    type: Schema.ObjectId,
    ref: 'Detalle'  
}
});

mongoose.model('Detalle', Detalle);

module.exports = mongoose.model('Fondo', Fondo);