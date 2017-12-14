var express = require('express');

// Add new routes here
var home = require('./home');
var handbook = require('./handbook');
var standings = require('./standings');
var archives = require('./archives');
var directory = require('./directory');
var content = require('./content');

var router = express.Router();

// establish route paths
router.get(/^(\/home|\/index|\/)$/, home.get);
router.get('/handbook', handbook.get);
router.get('/standings', standings.get);
router.get('/archives', archives.get);
router.get('/directory', directory.get);

// REST service for CMS
router.get('/content/find', content.find);
router.get('/content/:itemId', content.get);
router.delete('/content/:itemId', content.delete);
router.put('/content/:itemId', content.update);
router.post('/content', content.create);


module.exports = router;