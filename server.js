const express = require('express');
const url = require('url');
const app = express();
const searchSchema = require('./recentSearchTable');
const mongoose = require('mongoose');
const GoogleImages = require('google-images');
const client = new GoogleImages('009088407188627415974:iymdhlgs73k', 'AIzaSyD3XOwKlRu4Mc4PJjXZQb5wIih_PMfI8jA');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/imagesearchabstactionlayer/data');

app.get('/api/imagesearch/:SearchValue', function (req, res){
  var search_value = req.params.SearchValue;
  var offset_value = req.query.offset;
  
  var searchData = new searchSchema({
    searchValue : search_value,
    searchDate : new Date()
  });
  
  searchData.save(function(err){
    if(err){
      console.error('There was an error: ', err);
    }
    else{
      console.log('Save search data into mongodb success');
      res.send(searchData);
    }
  })
  
});

app.get('/api/latest/imagesearch', function(req, res){
  
  // open writeHead will cause an error :　"Error: Can't set headers after they are sent."
  // but i can figure out the reason!
  //res.writeHead(200, {'Content-Type' : 'application/json'});
  searchSchema.find({}, function(err, docs){
    if(err){
      res.send(err);
    }
    else{
      var queryData = new Array();
      for(var i in docs){
        queryData.push({'Term' : docs[i].searchValue, 'when': docs[i].searchDate});
      }
      res.json(queryData);
    }
  });
  
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})