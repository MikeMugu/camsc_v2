var genUtil = require('../utils/genUtil');

/* GET news page. */
exports.get = function(req, res) {
    res.render('archives', {
        title: 'Archives',
        isAdmin: GenUtil.isAdmin(req)
    });
}
