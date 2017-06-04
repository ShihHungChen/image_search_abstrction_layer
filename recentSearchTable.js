var mongo = require('mongodb').MongoClient;

function InsertSearchDataIntoDB(searchValue){
    mongo.connect('mongodb://localhost:27017/imagesearchabstactionlayer', function(err, db){
        if(err){
            db.close();
            return console.error('There was an error : ', err);
        }
        else{
            var collection = db.collection('recentSearch');
            var data ={value : searchValue, time : new Date()};
            collection.insert(data, function(err, result){
                if(err)
                    console.error('There was an error : ',err);
                else
                    console.log('Inserted a search data into recentSearch collection')
            })
        }
        db.close();
    })
}

function queryRecentSearchDataFromDB(callBack){
    mongo.connect('mongodb://localhost:27017/imagesearchabstactionlayer', function(err, db){
        if(err){
            db.close();
            return console.error('There was an error : ', err);
        }
        else{
            var collection = db.collection('recentSearch');
            var queryData = collection.find();
            console.log('Here');
            queryData.each(function(err, doc){
                if(err)
                    return console.error('There was an error : ', err);
                else
                    return console.log(doc);
            })
        }
        db.close();
    })
}


exports.InsertSearchDataIntoDB = InsertSearchDataIntoDB;
exports.queryRecentSearchDataFromDB = queryRecentSearchDataFromDB;