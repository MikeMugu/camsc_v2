var genUtil = require('../utils/genUtil');

/* GET standings page. */
exports.get = function(req, res) {
    res.render('standings', {
        title: 'Current Standings',
        isAdmin: GenUtil.isAdmin(req) 
    });
}
