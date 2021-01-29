const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tasks = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email is not valid")
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.length<=6 || value.toLowerCase().includes("password")){
                throw new Error("your password is invalid.")
        }
    }},
    age: {
        type: Number,
        default: 0, 
        validate(value){
            if(value<0){
                throw new Error('age must be a positive number')
            }
        }
    },
    tokens:[{token:{
        type:String,
        required: true
    }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField:'_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject

}

// generating token for user
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//identifying user by credentials
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

// hashing password from plain text
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    console.log("just before saving the user")
    next()
})

// deletes tasks of user that deletes his own user
userSchema.pre('remove', async function (next){
    const user = this
    await Tasks.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User;