var genUtil = require('../utils/genUtil');    

exports.get = function(req, res) {
    res.render('home', {
        title: 'Captial Area Middle School Conference (CAMSC)',
        isAdmin: GenUtil.isAdmin(req)
    });
}
