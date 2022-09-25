const mongoose = require('mongoose')

//the information that we'll get back about users for their profile from google using google auth for logins.
// ** CHANGES BY NOTHINGREMAINS: removed required from title/body.  Currently causing errors, need to be fixed and added back in when problem is found. Fixed 'default' typo in status.
const StorySchema = new mongoose.Schema({
    title: {
        type: String,
        
    },
    body: {
        type: String,
    
    },
    status: {
        type: String,
        default: 'public',
        enum: ['public', 'private']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, //connecting each user's story to the database object associated with that user. 
        ref: 'User',//ref back to user model
        required: true,  // to make sure the app pairs every story with a user to keep the app from breaking
    },
    createdAt: {
        type: Date,
        default: Date.now //Default will assign a value if none is provided. So it will assign now as the default if none is provided. 
    }
})

/* Passing in a new model for story */
module.exports = mongoose.model('Story', StorySchema)