var genUtil = require('../utils/genUtil');
var easypost = require('easypost');

/**
* Provides REST API for dealing with content blocks for the
* CMS portion of the app.
*/

/**
* Finds a record in the database that matches the incoming query.
*
* @param req 
*        The request object. We get the query off of the 
*        req object in the form of a q= querystring value.
*        Example: content/find?q={"@subject":"[id]"}'
*
* @param res The web response object. 
*/
exports.find = function(req, res) {
    var contentProvider = req.contentProvider;
    
    GenUtil.cleanQuery(req.query['q'].toString(), function(query, err) {
        if (err != null) {
            GenUtil.sendError(res, err.Message);
        }
        else {
            try {
                console.log("[content.find] called using query " + query);
                contentProvider.find(query, function(error, items) {
                    if (!error && items != null) {
                        console.log("Found items " + items);
                        res.json(items);
                    }
                    else {
                        // No records found
                        console.log("[content.find] No records found.");
                        res.status(404).json({ error: 'No records found.' });
                    }
                });
            }
            catch (err) {
                GenUtil.sendError(res, err.message);
            }
        }        
    });
}

/**
* Gets a single record from the database using the itemId passed
* in with the request object.
*
* @param req 
*        The request object. We get the query off of the 
*        req object in the form of a path value.
*        Example: content/:itemId
*
* @param res The web response object. 
*/
exports.get = function(req, res) {
    var contentProvider = req.contentProvider;
    var itemId = req.params.itemId;
    
    console.log("[content.get] Getting item with itemId " + itemId);
    try {
        contentProvider.findOne(itemId, function(error, result) {
            if (!error) {
                console.log("[content.get] Found item with itemId " + itemId + " to have data " + result);
                res.json(result);
            }
            else {
                GenUtil.sendError(res, error);
            }
        });
    }
    catch (err) {
        GenUtil.sendError(res, err.message);
    }
}

/**
* Creates a content record to the database. We use EasyPost
* here to serialize the data coming in off of the request
* so we can pass it to the data provider.
*
* @param req 
*        The request object. Gets serialized and passed 
*        to the data provider for persistance. Meant to 
*        work with the contentBlocks node package.
*
* @param res The web response object. 
*/
exports.create = function(req, res) {
    var contentProvider = req.contentProvider;
    console.log("[content.create] Creating item with request " + req);
    // Read post data.
    easypost.get(req, res, function (data) {
        // Check for script injection in json, unless url contains ?script=1
        if (GenUtil.isScriptInjection(req, res, data)) {
            GenUtil.sendError(res, 'Script tags are not allowed.');
        }
        else {
            try {
                // Insert the new item.
                console.log("[content.create] Saving data " + data);
                contentProvider.save(data, function(err) {
                    if (err != null) {
                        GenUtil.sendError(err);
                    }
                    else {
                        console.log("[content.create] Data saved. Response data " + data);
                        res.json(data);
                    }
                });
            }
            catch (err) {
                // Database error.
                GenUtil.sendError(res, err.message);
            }
        }
    });    
}

/**
* Updates a content block in the database. We use EasyPost
* to serialize the incoming request data and pass to the
* data provider.
*
* @param req 
*        The request object. Gets serialized and passed 
*        to the data provider for persistance. Meant to 
*        work with the contentBlocks node package.
*
* @param res The web response object. 
*/
exports.update = function(req, res) {
    var contentProvider = req.contentProvider;
    console.log("[content.update] Update called with request " + req);
    
    // Read post data.
    easypost.get(req, res, function (data) {
        // Check for script injection in json, unless url contains ?script=1
        if (GenUtil.isScriptInjection(req, res, data)) {
            GenUtil.sendError(res, 'Script tags are not allowed.');
        }
        else {
            try {
                var itemId = req.params.itemId;
                console.log("[content.update] Updating item " + itemId + " with data " + data);
                contentProvider.update(itemId, data, function(data, count) {
                    console.log("[content.update] Updated item with itemId " + itemId + " and data " + data);
                    res.json({ document: data, updated: count });
                });
            }
            catch (err) {
                GenUtil.sendError(res, err.Message);
            }
        }
    });                                 
}

/**
* Deletes a content block from the database.
*
* @param req The request object with itemId to delete.
* @param res The web response object. 
*/
exports.delete = function(req, res) {
    var contentProvider = req.contentProvider;
    
    try {
        var itemId = req.params.itemId;
        console.log("[content.delete] Deleting item with itemId " + itemId);
        contentProvider.delete(itemId, function(itemId, count) {
            console.log("[content.delete] Successfully deleted item with itemId " + itemId);
            res.json({ id: itemId, deleted: count });
        });
    }
    catch (err) {
        GenUtil.sendError(res, err.Message);
    }
}

