var router = require('express').Router();

var Category = require('../models/category');
var Job = require('../models/job');

var config = require('../config/config');

var cats = {};
var catnames = {"other":"###other###", "field":"###jobfield###", "type":"###jobtype###", "level":"###studylevel###"};

var loadcategories = function(callback) {
	cats = {};
	Category.find({}, function(err, results) {
		if (err) return next(err);
		if (results)
		{
			for (k in results)
			{
				var result = results[k];
				
				var name = result.name.toString();
				var cat = result.category;
				var id = result._id;
				var category = {name : name, category : cat, _id : id};
				if (id && id!="")
				{
					cats[cat] = cats[cat] || [];
					//cats[cat].push(category);
					cats[cat][id] = category;
				
					//jobfields[id] = field;
				}
			}
		}
	});
	//console.log("Loaded categories");
}
loadcategories();

router.get('/admin/reload-cats', function(req, res, next) {
	if (!res.locals.hasadmin) { return res.denied("###denied###"); }
	var result = loadcategories();
	res.setHeader("Access-Control-Allow-Origin", "*");
	return res.send(JSON.stringify(result, null, '\t'))
});

router.use(function(req, res, next) {
	res.locals.jobfields = cats.field || [];
	res.locals.jobtypes = cats.type || [];
	res.locals.studytypes = cats.level || [];
	
	res.locals.cats = cats || {};
	res.locals.catnames = catnames || {};
	
	res.locals.loadcategories = loadcategories;
	
	//loadcategories();
	
	next();
});

module.exports= router;