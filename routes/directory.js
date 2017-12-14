var genUtil = require('../utils/genUtil');

/* GET news page. */
exports.get = function(req, res) {
    res.render('directory', {
        title: 'Directory',
        isAdmin: GenUtil.isAdmin(req) 
    });
}
