var router = require('express').Router();
var fs = require('fs');

var config = require('../config/config');

var languages = {};
var loadlanguages = function(callback) {
	var data = fs.readFileSync('./config/languages.js', 'utf8', function(err, data){
		if (err) {
			console.log(err);
			return false; 
		}
	});
	languages = JSON.parse(data);
	//console.log(languages);
	console.log("Loaded translation file");
	return languages;
}
loadlanguages();

router.use(function(req, res, next) {
	//console.log('Cookies: ', req.cookies);
	if (req.cookies && req.cookies.language && languages[req.cookies.language])
	{
		res.cookie('language', req.cookies.language, { maxAge: 365 * 24 * 60 * 60 });
		res.locals.language = req.cookies.language;
	}
	else
	{
		res.cookie('language', config.default_language, { maxAge: 365 * 24 * 60 * 60 });
		res.locals.language = config.default_language;
	}
	
	res.locals.default_language = config.default_language;

	res.locals.languages = languages;

	
	res.locals.trans0 = function(input, lang)	{
		var lang = lang || res.locals.language;
		var deflang = res.locals.default_language;
		//var languages = res.locals.languages;
		if (input)
		{
			if (lang && languages[lang] && languages[lang][input])
			{
				return languages[lang][input];
			}
			else
			{
				if (input.slice(0, 3)=="###")
				{
					//handle missing string
					input0 = input.slice(3);
					console.log("untranslated: " + lang + ":" + input);
					
					languages[lang] = languages[lang] || {};
					languages[lang][input] = languages[lang][input] || input;

					var fileoutput = JSON.stringify(languages, null, '\t');
					fs.writeFileSync('./config/languages.js', fileoutput, 'utf8', function(err) {
						if(err) {
							console.log(err);
							return "";
						}
					}); 
					if (lang && languages[deflang] && languages[deflang][input])
					{
						return languages[deflang][input];
					}
				}
				else
				{
					var output = input;
					var dict = languages[lang] || {};
					var defdict = languages[deflang];
										
					for (k in defdict)
					{
						var reg = "###" + k;
						var tr = dict[k] || defdict[k];
						var re = new RegExp(reg, "g");
						output = output.replace(re, tr);
					}
					return output;
				}
			}
		}
		return "";
	}
		
	res.locals.trans = function(input, lang)
	{
		var lang = lang || res.locals.language;
		var deflang = res.locals.default_language;
		
		if (input)
		{
			var output = input;
			var dict = languages[lang] || {};
			var defdict = languages[deflang];
								
			for (k in defdict)
			{
				if (output && output!="" && output.replace)
				{
					var reg = "###" + k;
					var tr = dict[k] || defdict[k];
					var re = new RegExp(reg, "g");
					output = output.replace(re, tr);
				}
			}
			return output;
		}
		return input;
	}
	
	next();
});


router.get('/admin/reload-trans', function(req, res, next) {
	if (!req.user || !req.user.admin) { return res.render('main/denied'); }
	var result = loadlanguages();
	res.setHeader("Access-Control-Allow-Origin", "*");
	return res.send(JSON.stringify(result, null, '\t'))
});

module.exports= router;