var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var MongoClient = require('mongodb').MongoClient;
const { Client } = require('pg');
var mongoose = require('mongoose');
var format = require('string-format');

var mongoConnString = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ingredients';
var pgConnString = process.env.DATABASE_URL || 'postgres://localhost:5432/prithvisathiya';
var cuisines = ['none', 'American', 'Italian', 'Indian', 'Japanese', 'Chinese', 'Korean', 'Mexican', 'Vietnamese', 'Thai', 'French', 'English'];



/* GET home page. */
router.get('/', function(req, res, next) { 
	console.log(req.ip);
	var env = process.env.NODE_ENV || 'dev';
	res.render('index', { title: 'MealBuddy' , env: env}); 
}); 

function getReqQuery(req, idx) {
	var dev = {"high" : .2, "medium" : .1, "low" : 0};
	if(req.max == Infinity) {
		if(idx == 1) {
			var min = (parseFloat(req.min) - parseFloat(req.min) * dev[req.priority]);
			return 'and ' + req.name + ' > ' + mysql.escape(min) + ' '; 
		}
		return '';
	}else {
		var min = (parseFloat(req.min) - parseFloat(req.min) * dev[req.priority]);
		var max = (parseFloat(req.max) + parseFloat(req.max) * dev[req.priority]); 
		console.log(min + " " + max);
		if(idx == 1) {
			return 'and ' + req.name + ' between ' + mysql.escape(min) + ' and ' + mysql.escape(max) + ' '; 
		}
		return 'and coalesce(' + req.name + ',0) < ' + mysql.escape(max) + ' '; 
	}
} 

router.post('/submit', function(req, res, next) {
	var all = req.body.data;
	var query = "Select id, ndbno, Name, coalesce(servingsize,null) as servingsize, " +
	"coalesce(type, null) as Type, " +
	"coalesce(cuisine, null) as Cuisine, " +
	"coalesce(calories, null) as Calories, " +
	"Protein, " +
	"coalesce(fat, null) as Fat, " +
	"Carbohydrate, Fiber, " +
	"coalesce(sugar, null) as Sugar, " +
	"Iron, Magnesium, " +
	"coalesce(potassium, null) as Potassium, " +
	"coalesce(calcium, null) as Calcium, " +
	"coalesce(phosphorus, null) as Phosphorus, " +
	"Sodium, Zinc, " +
	"VitaminA, VitaminB6, VitaminB12, VitaminC, VitaminD, VitaminK, " +
	"Thiamin, Riboflavin, Niacin, " +
	"SaturatedFat, MonoUnsaturatedFat, PolyUnsaturatedFat, " +
	"Cholesterol, Caffeine, " +
	"imagePath " + 
	"from items_table where 1=1 "; 
	all.forEach(function(el, idx) {
		query += getReqQuery(el, req.body.searchTypeIdx);
		console.log(el.name + ' min: ' + el.min + ' max: ' + el.max);
		
	});
	var cuisineIdx = parseInt(req.body.idx);
	if(cuisineIdx > 0) {
		// query += "and cuisine in ('none','" + cuisines[cuisineIdx] + "') ";
		query += "and (cuisine like '%" + cuisines[cuisineIdx] + "%' or cuisine like '%none%') ";
	}
	if(req.body.hideProcessFood == "true") {
		query += "and processed = false "
	}
	query += "order by group1, group2, group3"
	console.log(query);
	const client = new Client({
		connectionString: pgConnString
	});
	client.connect(function(err) {
		if(err) {
			console.log('Error connecting to pg DB');
			console.log(err);
			res.write(JSON.stringify({"success": false, "error": err}));
			res.end();
		} else {
			console.log('Connection to pg DB successful');
			client.query(query, function(err, result) {
				if(err) {
					console.log(err);
					console.log('DB: Error retrieving from items');
					res.write(JSON.stringify({"success": false, "error": err}));
				}
				else {
					console.log('Number of rows retrieved: ' + result.rows.length);
					res.write(JSON.stringify({"success": true, "result": result.rows, "searchTypeIdx": req.body.searchTypeIdx}));
				}
				res.end();
				client.end();
			});
		}

	});
});

router.post('/viewAll', function(req, res, next) {
	var query = "Select id, ndbno, Name, coalesce(servingsize,null) as servingsize, " +
	"coalesce(type, null) as Type, " +
	"coalesce(cuisine, null) as Cuisine, " +
	"coalesce(calories, null) as Calories, " +
	"Protein, " +
	"coalesce(fat, null) as Fat, " +
	"Carbohydrate, Fiber, " +
	"coalesce(sugar, null) as Sugar, " +
	"Iron, Magnesium, " +
	"coalesce(potassium, null) as Potassium, " +
	"coalesce(calcium, null) as Calcium, " +
	"coalesce(phosphorus, null) as Phosphorus, " +
	"Sodium, Zinc, " +
	"VitaminA, VitaminB6, VitaminB12, VitaminC, VitaminD, VitaminK, " +
	"Thiamin, Riboflavin, Niacin, " +
	"SaturatedFat, MonoUnsaturatedFat, PolyUnsaturatedFat, " +
	"Cholesterol, Caffeine, " +
	"imagePath " + 
	"from items_table where 1=1 ";
	if(req.body.hideProcessFood == 'true') {
		query += "and processed = false ";
	}
	query += "order by group1, group2, group3 " 
	console.log(query);
	const client = new Client({
		connectionString: pgConnString
	});
	client.connect(function(err) {
		if(err) {
			console.log('Error connecting to pg DB');
			console.log(err);
			res.write(JSON.stringify({"success": false, "error": err}));
			res.end();
		} else {
			console.log('Connection to pg DB successful');
			client.query(query, function(err, result) {
				if(err) {
					console.log(err);
					console.log('DB: Error retrieving from items');
					res.write(JSON.stringify({"success": false, "error": err}));
				}
				else {
					console.log('Number of rows retrieved: ' + result.rows.length);
					res.write(JSON.stringify({"success": true, "result": result.rows, "searchTypeIdx": 2}));
				}
				res.end();
				client.end();
			});
		}

	});
});

router.post('/getIngredients/:ndbno', function(req, res, next) {
	var ndbno = req.params.ndbno;
	MongoClient.connect(mongoConnString, function(err, db) {
		if (err) {
			console.log('Error connecting to  mongoDB');
			console.log(err);
			res.write(JSON.stringify({"success": false, "error": err}));
			res.end();  
		}else {
			var query = { ndbno: ndbno};
			db.collection("ingredients").find(query).toArray(function(err, result) {
				if(err) {
					console.log(err);
					console.log('mongoDB: Error retrieving from ingredients');
					res.write(JSON.stringify({"success": false, "error": err}));
				}else if(result.length > 0) {
					res.write(JSON.stringify({"success": true, "ing": result[0].ing}));
				}else {
					res.write(JSON.stringify({"success": true, "ing": "N/A"}));
				} 
				res.end();
			});
		}
		db.close();
	});
});

 


module.exports = router;
