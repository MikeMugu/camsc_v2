var mongo = require('mongoskin');

/**
* Constructor
*
* @param db Initialized database instance.
*/
ContentProvider = function(db)
{
    this.db = db;
};

/**
* Returns the content collection from the database.
*
* @param callback Callback function to execute with collection.
* @example 
* content_collection.find(query).toArray(function(err, items) {
*   // Do something with the items.
* }
*/
ContentProvider.prototype.getCollection = function(callback) {
    this.db.collection('content', function(error, content_collection) {
        if (error) {
            callback(error);
        }
        else {
            callback(null, content_collection);
        }
    });
};

/**
* Returns a single record from the database using the supplied
* itemId as the query.
*
* @param callback Callback function to execute with collection.
* @example 
* contentProvider.findOne(itemId, function(err, document) {
*   res.json(document);
* }
*/
ContentProvider.prototype.findOne = function(itemId, callback) {
        this.getCollection(function(error, content_collection) {
        if (error) {
            callback(error);
        }
        else {
            var id = mongo.ObjectID.createFromHexString(itemId);
            content_collection.findOne({'_id': id }, function(err, document) {
                if (!err && document != null) {
                    callback(null, document);
                }
                else {
                    if (!err) {
                        callback('ID not found ' + itemId);
                    }
                    else {
                        throw err;
                    }
                }
            });
        }
    });
};

/**
* Returns a single record from the database using the supplied
* query object.
*
* @param query Query to use to find record. Example: { '@subject': 'mysubject' }
* @param callback Callback function to execute with collection.
* @example 
* contentProvider.find(query, function(error, result) {
*    res.json(result);
* });
*/
ContentProvider.prototype.find = function(query, callback) {
    console.log("find called with query " + query);
    this.getCollection(function(error, content_collection) {
        if (error) {
            callback(error);
        }
        else {
            content_collection.find(query).toArray(function (err, items) {
                if (!err && items != null) {
                    callback(null, items);
                }
                else {
                    if (err) {
                        console.log("An error ocurred trying to find: " + err);
                    }
                    callback("No records found.");
                }
            });
        }
    });
};




/**
* Saves a record to the database.
*
* @param data Data to save to db.
* @param callback Callback function to execute with collection.
* @example 
* contentProvider.save(data, function(err) {
*   res.json(data);
* }
*/
ContentProvider.prototype.save = function(data, callback) {
    this.getCollection(function(error, content_collection) {
        // Insert the new item.
        content_collection.insert(data, { safe: true }, function(err) {
            callback(err);
        });
    });
};

/**
* Updates a record in the database with the supplied data. If no
* record is found to update, an exception is thrown.
*
* @param itemId ID of item to update.
* @param data Data to save to db.
* @param callback Callback function to execute with collection.
* @example 
* try {
*   contentProvider.update(itemId, data, function(data, count) {
*       res.json(data);
*   }
* catch (ex) {
*   console.log('An error ocurred during update: ' + ex.message);
* }
*/
ContentProvider.prototype.update = function(itemId, data, callback) {
    this.getCollection(function(error, content_collection) {
        content_collection.update({ '_id': new mongo.ObjectID(itemId) }, data, { safe: true, multi: false }, function (err, count) {
            if (!err && count > 0) {
                callback(data, count);
            }
            else {
                if (err != null) {
                    throw err.message;
                }
                else {
                    throw 'No record could be updated with id ' + itemId + '.';
                }
            }
        });
    });
};
    
/**
* Deletes a record from the database with the supplied itemId. If no
* record is found to delete, an exception is thrown.
*
* @param itemId ID of item to delete.
* @param callback Callback function to execute. 
* @example 
* try {
*   contentProvider.delete(itemId, function(itemId, count) {
*       res.json({ id: itemId, deleted: count});
*   }
* catch (ex) {
*   console.log('An error ocurred during delete action: ' + ex.message);
* }
*/  
ContentProvider.prototype.delete = function(itemId, callback) {
    this.getCollection(function(error, content_collection) {
        var objectId = mongo.ObjectID.createFromHexString(itemId);
        content_collection.remove({ '_id' : itemId }, { safe: true, multi: false }, function(err, count) {
            if (!err && count > 0) {
                callback(itemId, count);
            }
            else {
                if (err != null) {
                    throw err.Message;
                }
                else {
                    throw 'No record delete. Couldnot find content block with id ' + itemId + '.';
                }
            }
        });
    });
};
    
    
exports.ContentProvider = ContentProvider;