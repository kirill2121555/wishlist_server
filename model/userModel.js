const {Schema, model}=require('mongoose');

const UserSchema=new Schema({
    email:{type:String,required: true,unique:true,index: true},
    password:{type:String,required: true},
    activateLink:{type:String},
    isActivate:{type:Boolean,default:true},
    nick:{type:String,required: true },
    birthday:{type:Date,index: true},
    wish:[{type:Schema.Types.ObjectId, ref:'Wish'}],
    friends:[{type:Schema.Types.ObjectId, ref:'User'}],
})

module.exports=model('User',UserSchema);