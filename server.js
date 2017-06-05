const express = require('express');
const searchSchema = require('./recentSearchTable')
const url = require('url');
const app = express();
const mongoose = require('mongoose');

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
  
  searchSchema.find().where('recent_search').exec(function(err, data){
    if(err){
      console.error('There was an error: ', err);
    }
    else{
      console.log(data);
    }
  });
  
  res.end();
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})