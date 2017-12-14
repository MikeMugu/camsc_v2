# Capital Area Middle School Conference (CAMSC) Website
This website is for use by the Capital Area Middle School athletic conference. 
It is written in NodeJS and uses CreateJs.org (http://createjs.org/) and 
ContentBlocks (https://github.com/primaryobjects/contentblocks)
to provide a CMS system for the administrators of this site. 

If you stumble upon this and want to use it as a template or starter
to build your own CMS site, feel free, but please honor the license
of the libraries in use.


### Setting up
1. Install NodeJS (if you don't have it)
2. Install npm 
3. Install Mongo (used to store the content blocks)
4. Download the code (duh)
5. Navigate to the directory where your code is located and run: npm install


### Starting the app
To start the app, do the following:

1. Start Mongo (assuming path here):
  1. cd c:\Mongo
  2. cmd /k mongod --dbpath c:\dev\camsc\data

2. Start the app (assuming path here):
  1. cd c:\dev\camsc
  2. cmd /k npm start

3. Connect to Mongo terminal if you want:
  1. cd c:\Mongo
  2. mongo
  3. use camsc
