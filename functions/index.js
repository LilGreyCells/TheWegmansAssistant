'use strict';
const axios = require('axios');
const geolib = require('geolib');
process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');




// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'welcome';
// b. the parameters that are parsed from the make_name intent 


exports.wegmans = functions.https.onRequest((request, response) => {
  const authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ino0NHdNZEh1OHdLc3VtcmJmYUs5OHF4czVZSSIsImtpZCI6Ino0NHdNZEh1OHdLc3VtcmJmYUs5OHF4czVZSSJ9.eyJhdWQiOiJodHRwczovL3dlZ21hbnMtZXMuYXp1cmUtYXBpLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzEzMThkNTdmLTc1N2ItNDViMy1iMWIwLTliM2MzODQyNzc0Zi8iLCJpYXQiOjE1MTcxMjk0NzgsIm5iZiI6MTUxNzEyOTQ3OCwiZXhwIjoxNTE3MTMzMzc4LCJhaW8iOiJZMk5nWUVpNS9kNXM5OFJ2bFJuTTE2VWQrYnc1QVE9PSIsImFwcGlkIjoiMmZhOGY3MWYtY2VjNS00OWU5LWJkMGEtMjI3ODBkYzI2YTliIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMTMxOGQ1N2YtNzU3Yi00NWIzLWIxYjAtOWIzYzM4NDI3NzRmLyIsIm9pZCI6ImY0NTIwYmRmLTc1NWItNGY5Yi1iNWJkLTI4NGJiYTI2MTEwOSIsInN1YiI6ImY0NTIwYmRmLTc1NWItNGY5Yi1iNWJkLTI4NGJiYTI2MTEwOSIsInRpZCI6IjEzMThkNTdmLTc1N2ItNDViMy1iMWIwLTliM2MzODQyNzc0ZiIsInV0aSI6IkxraUNMWUNtWVVDN2RXNmtpbHNTQUEiLCJ2ZXIiOiIxLjAifQ.IbQ23a_KC1nvkNffIkNMYVVNx2UrjWqXc6DBy06FqrMGVz5jLg_0rnze432UbTudRH5Uq-jIlpZvzEtHlsk7dNuyaa6-RsszJlNjxoZ-Rm89MN4cMBWjQ4c86g1vtI18ecLwsF9aa2a-VU70Z9bwOj6lbsgPNY_55whkG3kQpKqqfTsipWpXVCW85sXUB_2p633gKlgndlQPrPyJDTQLevYzi0LcD4lBIaDMafvQRVFPOut2iRKOSABfoTcZsW8KpoJNsxYbGUgpLSssC9xMbFc_1IC1mD1bJmwy4KjRbHzOeCKNdoyo0VwoOExSfnKMrYTnT4GheUb9KHyHWewRCA"
  const key = "658b9235dc6b4d32a1349ec6e40536aa"
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  function getNearestWegmans(myLatitute, myLongitute) {
    return axios.get('https://wegmans-es.azure-api.net/locationpublic/location/stores?LocationType=FoodMarket', {
              "headers": {
            "authorization": authorization,
            "location-subscription-key": key,
            "LocationType": "FoodMarket"
          }
          }).then((response) => {
            let data = response.data
            let min_i = -1
            let min_i2 = -1
            let min2Distance = 99999999999
            let min_distance = 99999999999
            for(var i = 0; i< data.length; i++){
              let currentLong = data[i]["Location"]["Longitude"]
              let currentLat = data[i]["Location"]["Latitude"]
              let distance = geolib.getDistance({latitude: myLatitute, longitude: myLongitute}, {latitude: currentLat, longitude: currentLong})
              if(min_distance > distance){
                min2Distance = min_distance
                min_i2 = min_i
                min_distance = distance
                min_i = i
              }
            }
            let min_store = data[min_i]
            let min2_store = data[min_i2]
            return ["Welcome to " + min_store["Name"] + " " + min_store["Location"]["LocationType"], min_store["StoreNumber"]]
            // return [min_store, min2_store]
          }).catch((error) =>{
              console.log(error)
          })
  }

// c. The function that generates the silly name
  function welcome (app) {
    // let latitude = app.getArgument(request.body.LATITUDE);
    // let longitude = app.getArgument(request.body.LONGITUDE);
    // const permission = app.SupportedPermissions.DEVICE_PRECISE_LOCATION;
    // app.askForPermission("To find the closest Wegmans", permission);
    // app.ask("Welcome to Wegmans! What can I help you with?");
    app.askForPermission('Welcome to Wegmans. To locate you', app.SupportedPermissions.DEVICE_PRECISE_LOCATION);
  }

  // const requestPermission = (app) => {
  //     app.askForPermission('To locate you', app.SupportedPermissions.DEVICE_PRECISE_LOCATION);
  //   };

  const userInfo = (app) => {
        if (app.isPermissionGranted()) {
            const coordinates = app.getDeviceLocation()["coordinates"];
            Promise.all([
              getNearestWegmans(coordinates.latitude, coordinates.longitude),
            ]).then((a) => {
                console.log(a)
                app.userStorage.StoreNumber = a[0][1]
                app.ask(a[0][0]+ ". How can I help?")
            }).catch((e) =>{
                app.tell("Error!")
                console.log(e)
            })

            // app.ask("We found you! " + address);
        } else {
            app.tell('Sorry, I could not figure out where you are.');
        }
    };

  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(NAME_ACTION, welcome);
  // actionMap.set("permission_action", requestPermission)
  actionMap.set("user_info", userInfo)
  


app.handleRequest(actionMap);
});