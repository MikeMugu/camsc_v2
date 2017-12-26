#!/bin/env node

var express         = require('express');
var fs              = require('fs');
var path            = require('path');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var logger          = require('morgan');
var favicon         = require('serve-favicon');

var ContentProvider = require('./providers/mongoProvider-content').ContentProvider;

/**
 *  Define the application.
 */
var CapitalAreaMSC = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
        self.port      = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
        self.host      = process.env.OPENSHIFT_APP_DNS || 'localhost';
        
        var dbUrl = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
        var dbUrlLabel = '';

        // Setup database connection
//        if (self.ipaddress == '127.0.0.1') {
//            dbUrlLabel = 'mongodb://localhost:27017/camsc';
//            self.db_connection = dbUrlLabel;
//        }
//        else {
            if (!dbUrl && process.env.DATABASE_SERVICE_NAME) {
                console.log("Constructing db connection...");
                var dbServiceName = process.env.DATABASE_SERVICE_NAME;
                var dbUser = process.env[dbServiceName + '_USER'];
                var dbPwd = process.env[dbServiceName + '_PASSWORD'];
                var dbName = process.env[dbServiceName + '_DATABASE'];
                var dbHost = process.env[dbServiceName + '_SERVICE_HOST'];
                var dbPort = process.env[dbServiceName + '_SERVICE_PORT'];

                if (dbHost  && dbPort && dbName) {
                    dbUrlLabel = dbUrl = 'mongodb://';

                    if (dbUser && dbPwd) {
                        dbUrl += dbUser + ':' + dbPwd + '@';
                    }
                    // Provide UI label that excludes user id and pw
                    dbUrlLabel += dbHost + ':' + dbPort + '/' + dbName;
                    dbURL += dbHost + ':' +  dbPort + '/' + dbName;
                }

                self.db_connection = dbUrl;
            }
//        }
        console.log('Database Url resolved to: ' + dbUrlLabel);
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        var routes = require('./routes');
        var users = require('./routes/users');

        self.app.use('/', routes);
        self.app.use('/users', users);
        self.app.use(express.static(__dirname + '/public'));
        
        self.app.use(function(req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        
        // error handlers

        // development error handler
        // will print stacktrace
        if (self.app.get('env') === 'development') {
            self.app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        self.app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });       
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        // initialize express
        self.app = express();
        
        // view engine setup
        self.app.set('views', path.join(__dirname, 'views'));
        self.app.set('view engine', 'jade');
        
        self.app.use(bodyParser.json());
        self.app.use(cookieParser());
        self.app.use(express.static(path.join(__dirname, 'public')));
        self.app.use(logger('dev'));

        // setup utility modules
        self.app.locals.moment = require('moment');
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
        
        // setup CMS editing plugin
        self.initializeContentBlocks();
        
        // setup the database
        self.initializeDb();
        
        // create routes
        self.createRoutes();
    };
    
    /**
    * Initializes the contentBlocks/CreateJS.org plugin
    */
    self.initializeContentBlocks = function() {
        self.contentBlocks = require('contentblocks')(
        { 
            app: self.app, 
            host: self.host, 
            port: self.port,
            pathFind: '/content/find?q={"@subject":"[id]"}',
            pathPost: '/content', 
            pathPut: '/content/[id]', 
            pathDelete: '/content/[id]' 
        });
        
        self.app.use(self.contentBlocks.render);        
    };
    
    /**
    * Sets up the connection to mongoDB.
    */
    self.initializeDb = function() {
        var mongo = require('mongoskin');
        var db = mongo.db(self.db_connection, {native_parser:true});
        
        self.contentProvider = new ContentProvider(db);
        self.app.use(function(req,res,next){
            req.contentProvider = self.contentProvider;
            next();
        });
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   


/**
 *  main():  Main code.
 */
var camsc = new CapitalAreaMSC();
camsc.initialize();
camsc.start();

