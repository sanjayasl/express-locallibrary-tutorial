var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});

// Virtual for author's formatted dob
AuthorSchema
    .virtual('date_of_birth_formatted')
    .get(function () {
        return moment(this.date_of_birth).format('MMMM Do, YYYY');
    });

// Virtual for author's formatted dod
AuthorSchema
    .virtual('date_of_death_formatted')
    .get(function () {
        return moment(this.date_of_death).format('MMMM Do, YYYY');
    })

// Virtual for author's formatted dob
AuthorSchema
    .virtual('date_of_birth_input')
    .get(function () {
        return moment(this.date_of_birth).format('YYYY-MM-DD');
    });

// Virtual for author's formatted dod
AuthorSchema
    .virtual('date_of_death_input')
    .get(function () {
        return moment(this.date_of_death).format('YYYY-MM-DD');
    })

//Export model
module.exports = mongoose.model('Author', AuthorSchema);
