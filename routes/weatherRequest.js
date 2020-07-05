const http = require('http');
const express = require('express');

/** Weather api domain and end point */ 
const domain = 'api.openweathermap.org'
const cWeatherEndPoint = 'data/2.5/weather'

/** Express routes **/
const router = express.Router();
router.route('/')
.get((req,response,next)=>{

  let city = req.query.city.trim();
  //LOG FOR DEBUGGING PURPOSES
  console.log('requested city : '+city);
  if(!city || city==='')
  {
    let error = new Error('Bad request');
    error.status = 401;
    next(error);
  }
  else
  {
    //creating url
    let url = `http://${domain}/${cWeatherEndPoint}?q=${city}&appid=${process.env.apiKey}`;
    //DEBUG 
    console.log('url : '+url);
    //making request to api
    try{
      http.get(url,(res)=>{
        if('application/json' === res.headers['content-type'].split(';')[0])
        {
          res.setEncoding('utf8');
    
          let result = '';
          res.on('data',(content)=>{result+=content});
          res.on('end',()=>{
            if(res.statusCode===200) //data for the city successfully recieved
            {
              let weatherReport = JSON.parse(result);
    
              //EXTRACTING INFO FROM JSON RESPONSE
              let cityName = weatherReport.name;
              let coord = {'latitude':weatherReport.coord.lat,
                          'longitude':weatherReport.coord.lon
                          };
              let weather = weatherReport.weather[0].main;
              let description = weatherReport.weather[0].description;
              let temp = weatherReport.main.temp;
              let tempPerception = weatherReport.main.feels_like;
              let minTemp = weatherReport.main.temp_min;
              let maxTemp = weatherReport.main.temp_max;
              //PRINTING RESULT
              console.log('--- RESPONSE ----');
              console.log(`city : ${cityName}   coordinate : ${coord.latitude}°N ${coord.longitude}°E`);
              console.log(`Weather : ${weather}   Description : ${description}`);
              console.log(`temp : ${temp}K  Max Temp : ${maxTemp}K  Min Temp : ${minTemp}K`);
              console.log(`Feels Like : ${tempPerception}`);
              console.log('----- REQUEST COMPLETED -----');
              //SENDING RESPONSE TO CLIENT
              response.statusCode = 200;
              response.setHeader('content-type','application/json');
              response.json(weatherReport);
            }
            else//api respond with anything other than success
            {
              result = JSON.parse(result);
              response.setHeader('content-type','application/json');
              
              let error = new Error(result.message);
              error.status = res.statusCode;
              next(error);
            }
          });
        }
        else//response is not json thus some error would have occured
        {
          let error = new Error(res);
          error.status = res.statusCode;
          next(error);
        }    
      });
    }catch(error){
      console.log('ERROR :-> '+error);
      let err = new Error(error);
      next(err);
    }
    
  }

});

module.exports = router;



