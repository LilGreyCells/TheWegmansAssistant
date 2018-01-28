'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'input_welcome';
// b. the parameters that are parsed from the make_name intent 
const LATITUDE = 'mockLocation.coordinates.latitude';
const LONGITUDE = 'mockLocation.coordinates.longitude';


exports.wegmans = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


// c. The function that generates the silly name
  function input_welcome (app) {
    let latitude = app.getArgument(request.body.LATITUDE);
    let longitude = app.getArgument(request.body.LONGITUDE);
    app.tell("So this is your latitude: "+ latitude + ". and this is your longitude" + longitude );
  }
  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(NAME_ACTION, input_welcome);


app.handleRequest(actionMap);
});