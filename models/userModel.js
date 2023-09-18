const mongoose=require("mongoose");
const validator=require("validator");
const bycrypt=require("bcryptjs");
const crypto=require("crypto");
//name,email,password,confirmpassword,image

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide your name"]
    },
    email:{
        type:String,
        required:[true,"Please provide your email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"Please provide a valid email"]
    },
    photo:String,
    role:{
        type:String,
        enum:["admin","user","guide","creater"],
        default:"user"
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,"Please confirm your password"],
        validate:{
            validator:function(el){
                return el==this.password
            },
            message:"Password is no the same"
        }
    },
    changePasswordAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
});
userSchema.pre(/^find/,function(next){
this.find({active:{$ne:false}});
next();
})
userSchema.pre("save",async function(next){
    if(!this.isModified("password") ||this.isNew)return next();
    this.changePasswordAt=Date.now()-1000;
    next();
});
userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    //Run this code
    //hash the password
    this.password=await bycrypt.hash(this.password,12);
    //Password confirm deleted not save in database
    this.passwordConfirm=undefined
    next();
});
userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bycrypt.compare(candidatePassword,userPassword);
}
userSchema.methods.changePasswordAfter=function(JWTTimestamp){
    if(this.changePasswordAt){
        const changeTimeStamp=parseInt(this.changePasswordAt.getTime()/1000,10);
        console.log(JWTTimestamp,changeTimeStamp);
        return JWTTimestamp<changeTimeStamp;
    }
    //By default we want to run false mean no change
    return false;
}
userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires=Date.now()+10 * 60 * 1000;
    return resetToken;
}
const User=mongoose.model("User",userSchema);
module.exports=User;