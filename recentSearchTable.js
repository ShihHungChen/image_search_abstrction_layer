const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const searchData = new Schema({
    searchValue : String,
    searchDate : Date
})

const modelClass = mongoose.model('recent_search', searchData);

module.exports = modelClass;