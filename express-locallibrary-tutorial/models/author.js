const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

/* 
first_name
family_name
date_of_birth
date_of_death
*/

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxLength: 100 },
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

AuthorSchema.virtual('name').get(function () {
    let fullname = "";
    if (this.first_name && this.family_name) {
        fullname = `${this.family_name}, ${this.first_name}`;
    }

    return fullname;
})

AuthorSchema.virtual('date_of_birth_ISO').get(function() {
    return DateTime.fromJSDate(this.date_of_birth).toISODate();
})

AuthorSchema.virtual('date_of_death_ISO').get(function() {
    return DateTime.fromJSDate(this.date_of_death).toISODate();
})

AuthorSchema.virtual('lifespan').get(function() {
    let birth = 'Unknown'; 
    let death = '';

    if (DateTime.fromJSDate(this.date_of_birth).isValid) {
        birth = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    } 

    if (DateTime.fromJSDate(this.date_of_death).isValid) {
        death = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    } 
    
    return `${birth} ~ ${death}`
})

AuthorSchema.virtual("url").get(function () {
    return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);