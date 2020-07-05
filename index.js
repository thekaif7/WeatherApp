const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const weatherRequest = require('./routes/weatherRequest');
require('dotenv').config();


const app = express(); //express application

app.use(morgan('dev'));
app.use(bodyParser.json())

//making request
app.use('/weather',weatherRequest);

//serving static files
app.use(express.static(path.join(__dirname,'testFiles')));
app.get('/',(req,res,next)=>{
  res.statusCode = 200;
  res.sendFile('form.html',{root:path.join(__dirname,'testFiles')},(error)=>{
    if(error)
      {
        let err = new Error(error);
        err.status = 404;
        next(err);
      }
  });
});

//error handler
app.use((err, req, res, next)=>{
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send(err);
})


/* starting server at port 8080 */
const port = 8080;
const hostname = 'localhost'
const server = http.createServer(app);
server.listen(port,hostname,()=>console.log('server started...'));
