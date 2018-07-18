var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
  console.log('Something is happening.');
  next();
});

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our rest video api!' });  
});


router.route('/cursos')

    .post(function(req, res) {
        var query = req.body.queryResult;
        var queryText = query.queryText;

        console.log("queryText: " + queryText);

        var intent = query.intent;

        if (intent.displayName == 'I1_Cursos_IT'){
            console.log("Intent 1 recibido: ");
            res.json({ fulfillmentText: 'Tenemos todos los cursos que quieras' });
        } else {
            res.json({ message: 'Post Recibido' });
        }
    })

    .get(function(req, res) {
        console.log(req.body);
        res.json({ message: 'Get recibido' });
    });

module.exports = router;