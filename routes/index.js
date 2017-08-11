var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'Foods'
});

connection.connect(function(err) {
	if (err) {
		console.log('Error connecting to DB');
	}else console.log('Connection to DB successful');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/submit', function(req, res, next) {
  var all = req.body.data;

  if(all) {
  	res.send('success from server');
  }
  
  all.forEach(function(el, idx) {
	console.log(el.name + ": " + el.priority);
  });
  
});

router.get('/getItems', function(req, res, next) {
	// console.log("fetching items from db")
	var data = [{"name": "something", "calories": 5},{"name": "nothing", "calories": 25}];
	connection.query('Select * from items', function(err, rows) {
		if(err) console.log('Error retrieving from items');
		else {
			console.log(rows);
			res.send(JSON.stringify({"result": rows}));
		}
		
	});
	
});

module.exports = router;
