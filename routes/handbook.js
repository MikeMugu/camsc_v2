var genUtil = require('../utils/genUtil');

exports.get = function(req, res) {
    res.render('handbook', {
        title: 'Constituion and Bylaws',
        isAdmin: GenUtil.isAdmin(req)
    });
}
 