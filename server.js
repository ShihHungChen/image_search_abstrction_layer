// Require module
const express = require('express');
const url = require('url');
const app = express();
const searchSchema = require('./recentSearchTable');
const mongoose = require('mongoose');
const GoogleImages = require('google-images');

var fs = require('fs');
var key_data = JSON.parse(fs.readFileSync('./key_data.json', 'utf8'));
const client = new GoogleImages(key_data.CSE_ID,key_data.API_KEY);

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/imagesearchabstactionlayer/data');

// express get functions
app.get('/api/imagesearch/:SearchValue', function (req, res){
  var search_value = req.params.SearchValue;
  var offset_value = req.query.offset;
  
  // save data into db
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
    }
  })
  
  // process offset
  var searnSiglePage = true;
  if(offset_value){
    searnSiglePage = (offset_value % 10) === 0;
  }
  
  // do image search
  if(searnSiglePage){
    if(offset_value){
      var page_value = parseInt(offset_value/10) + 1;
    }
    else{
      var page_value = 1;
    }
    client.search(search_value, {page : page_value}).then(function(images){
      var result_container = new Array();
      for(var i in images){
        result_container.push({'url': images[i].url,
                               'description': images[i].description,
                               'thumbnail': images[i].thumbnail.url,
                               'parentPage': images[i].parentPage
        });
      }
      res.json(result_container);
    });
  }
  else{ // need search twice and print the result fit to the offset
  
    var finished = 0;
    var page_value = parseInt(offset_value/10) + 1;
    var result_container = new Array(10);
    
    // do first search
    client.search(search_value, {page : page_value}).then(function(images){
      for(var index1 = (offset_value % 10), index_res_con = 0; index1 < 10; ++index1){
        result_container[index_res_con++] = ({'url': images[index1].url,
                                              'description': images[index1].description,
                                              'thumbnail': images[index1].thumbnail.url,
                                              'parentPage': images[index1].parentPage
        });
      }
      
      finished++;
      if(finished === 2){
        res.json(result_container);
      }
    });
    
    // do second search
    client.search(search_value, {page : page_value + 1}).then(function(images){
      for(var index1 = 0, index_res_con = 0; index1 < (offset_value % 10); ++index1, ++index_res_con){
        result_container[10 - offset_value + index_res_con] = ({'url': images[index1].url,
                                                                'description': images[index1].description,
                                                                'thumbnail': images[index1].thumbnail.url,
                                                                'parentPage': images[index1].parentPage
        });
      }
      
      finished++;
      if(finished === 2){
        res.json(result_container);
      }
    });
    
  }
  
});

app.get('/api/latest/imagesearch', function(req, res){
  
  searchSchema.find({}, function(err, docs){
    if(err){
      res.send(err);
    }
    else{
      var queryData = new Array();
      for(var i in docs){
        queryData.unshift({'Term' : docs[i].searchValue, 'when': docs[i].searchDate});
      }
      res.json(queryData);
    }
  });
  
})

app.get('*', function(req, res){
  res.writeHead(404,{'Content-Type' : 'text/plain'});
  res.end('404 error! it\'s not supported operation');
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})