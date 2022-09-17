const {Schema, model}=require('mongoose');

const WishSchema=new Schema({
    title:{type:String,required: true},
    datecreate:{type:Date,default: Date.now},
})

module.exports=model('Wish',WishSchema);