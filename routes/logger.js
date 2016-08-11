//https://github.com/expressjs/morgan#log-file-rotation

var FileStreamRotator = require('file-stream-rotator')

var express= require('express');

var router= express.Router();

var fs = require('fs')
var morgan = require('morgan')
var path = require('path')

var config = require('../config/config');

var logDirectory = path.join("./", 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, '%DATE%.log'),
  frequency: 'daily',
  verbose: false
})


morgan.token('logmsg', function (req, res) { return res.locals.ifbmsg || ""; });

morgan.token('datestamp', function (req, res) { return res.locals.Datestamp || ""; });
morgan.token('timestamp', function (req, res) { return res.locals.Timestamp || ""; });

//var logformat = ':timestamp :remote-addr :remote-user :method :url :status - :response-time ms';

// setup the loggers

	
router.use('/ifb', morgan(':datestamp :timestamp :remote-addr :remote-user [IFB] [:status] :url - :response-time (ms) ":logmsg"'));
router.use('/ifb', morgan(':timestamp :remote-addr :remote-user [IFB] [:status] :url - :response-time (ms) ":logmsg"', {stream: accessLogStream}));

router.post('/ifb', function(req,res,next){
	if (req && req.body && req.body.ifbmsg ) {
		var ifbmsg = req.body.ifbmsg || "";
		ifbmsg = ifbmsg.replace(/[\r\n"]+/g," ");
		ifbmsg = ifbmsg.replace(/["]+/g,"'");
		res.locals.ifbmsg = ifbmsg;	
	}
	
	return res.redirect(res.locals.referer);
});

router.use(morgan(':datestamp :timestamp :remote-addr :remote-user [:method] [:status] :url - :response-time (ms)'));
router.use(morgan(':timestamp :remote-addr :remote-user [:method] [:status] :url - :response-time (ms)', {stream: accessLogStream}));


module.exports= router;
