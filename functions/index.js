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
  const authorization = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ino0NHdNZEh1OHdLc3VtcmJmYUs5OHF4czVZSSIsImtpZCI6Ino0NHdNZEh1OHdLc3VtcmJmYUs5OHF4czVZSSJ9.eyJhdWQiOiJodHRwczovL3dlZ21hbnMtZXMuYXp1cmUtYXBpLm5ldCIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzEzMThkNTdmLTc1N2ItNDViMy1iMWIwLTliM2MzODQyNzc0Zi8iLCJpYXQiOjE1MTcxMzc0MzAsIm5iZiI6MTUxNzEzNzQzMCwiZXhwIjoxNTE3MTQxMzMwLCJhaW8iOiJZMk5nWUREaWt2OGkzWG5nNlVUbjUxbXNxeGZsQXdBPSIsImFwcGlkIjoiMmZhOGY3MWYtY2VjNS00OWU5LWJkMGEtMjI3ODBkYzI2YTliIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMTMxOGQ1N2YtNzU3Yi00NWIzLWIxYjAtOWIzYzM4NDI3NzRmLyIsIm9pZCI6ImY0NTIwYmRmLTc1NWItNGY5Yi1iNWJkLTI4NGJiYTI2MTEwOSIsInN1YiI6ImY0NTIwYmRmLTc1NWItNGY5Yi1iNWJkLTI4NGJiYTI2MTEwOSIsInRpZCI6IjEzMThkNTdmLTc1N2ItNDViMy1iMWIwLTliM2MzODQyNzc0ZiIsInV0aSI6InFEMXJiVFpOLUVtY2xOa2dnckVUQUEiLCJ2ZXIiOiIxLjAifQ.BdlD6L0kepQOStd6AykWarlBQUFT4bGG3FASwofXqL6TPv7Ias6BoF3XE_lvK2OJjVx9oazW3nEPsmeyAiPOSnpR_g1P7XH_CrAZQwhei1JOGXAZIejKJuIMfQb1H8IeIgunHt28EjJmc78q2ET96JoA6T7MVMACffy56oxT8oL0deo_wLflAvP-skmXgZuG8CJAlO0pP_EI7IojqYf2LzbC6kIl0ReNj6oiiprcAoicmxiWKGLyyic6akL0GuDYV4831OCLyAMFvv-HQglFLMd_tU9nhJOgVYptoYrTqwP15zFcSq8R_s-7xCP-PPzOvc1lrvXNnta6nJyksatMPg"
  const key = "658b9235dc6b4d32a1349ec6e40536aa"
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  function findProductAvailibilityByStore(ItemNumber, storeId, i){
    return axios.get('https://wegmans-es.azure-api.net/productpublic/productavailability/'+ItemNumber+'/'+storeId, {
            "headers": {
          "authorization": authorization,
          "product-subscription-key": key,
          "cache-control": "no-cache",
          "postman-token": "82bdfc5d-4f66-a3b1-64ad-cdd10caa6ee8"
        }
        }).then((response) =>{
          return [response["data"][0]["IsAvailable"], i]
        }).catch((error) =>{
            console.log(error)
        })
  }

  function findProductFromAPI(productName){
    return axios.get('https://wegmans-es.azure-api.net/productpublic/products/search?criteria=' + productName, {
            "headers": {
          "authorization": authorization,
          "product-subscription-key": key
        }
        }).then((response) =>{
          let itemss = []
          let result = response.data["Results"]
          for (var i = 0; i < 4; i++) {
            // console.log(result[i])

            itemss.push([result[i]["ItemNumber"], result[i]["Description"]])
          }
          return itemss

        }).catch((error) =>{
            console.log(error)
        })
  }

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

                var richResponse = app.buildRichResponse();
                var simpleResponse1 = {
                      speech: ''+a[0][0],
                      displayText: ''+a[0][0]
                }
                var simpleResponse2 = {
                      speech: "Here's what you can do...",
                      displayText: "Here's what you can do..."
                }
                richResponse.addSimpleResponse(simpleResponse1);
                richResponse.addSimpleResponse(simpleResponse2);
                richResponse.addSuggestions(['I want some tomatoes','search for coca-cola'])
                app.ask(richResponse)


                // app.ask(a[0][0]+ ". How can I help?")
            }).catch((e) =>{
                app.tell("Error!")
                console.log(e)
            })

            // app.ask("We found you! " + address);
        } else {
            app.tell('Sorry, I could not figure out where you are.');
        }
    };
    //TODOOOOOO

    function findImageFromProduct(product){
        url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAhIedchF_DyB-Zk8HUbjEtfBRdVUdXJA4&cx=018005371202290893977:rleijs8aesm&q=" + product[1] + "&searchType=image&fileType=jpg&imgSize=large&alt=json"     
        return axios.get(url).then((response) => {
            return response.data
        }).catch((error) => {
            console.log(error)
        })
    }



    function findProduct(app){
      Promise.all([findProductFromAPI(app.getArgument("product"))]).then((a)=>{
          //This is the array of product id, product name
          let temp = a[0]
          let temp2 = {
            temp[0][0]: [temp[0,1]],
            temp[1][0]: [temp[0,1]],
            temp[2][0]: [temp[0,1]],
            temp[3][0]: [temp[0,1]]
          }
          app.ask("I found this! " + temp[0][1])
          for(var i = 0; i < temp.length; i ++ ){
            Promise.all([findImageFromProduct(temp[i])]).then((a)=>{
              //Here are your urls for image
              //a[0]
              console.log(a[0].items[0].url)
            })
          }
          url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAhIedchF_DyB-Zk8HUbjEtfBRdVUdXJA4&cx=018005371202290893977:rleijs8aesm&q=<SEARCH_QUERY>&searchType=image&fileType=jpg&imgSize=small&alt=json"
      }).catch((error)=>{
        console.log(error)
        app.tell("Error")
      })
    }

  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(NAME_ACTION, welcome);
  // actionMap.set("permission_action", requestPermission)
  actionMap.set("user_info", userInfo)
  actionMap.set("find-product", findProduct)
  


app.handleRequest(actionMap);
});