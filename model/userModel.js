const mongoose = require("mongoose");
const crypto = require('crypto')
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
    },
    email: {
        type: String,
    },

    mobile: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true
    },
    
    
}, { timestamps: true })

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

  


module.exports = mongoose.model('User', userSchema)
