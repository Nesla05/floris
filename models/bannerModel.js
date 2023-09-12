const mongoose=require("mongoose")

var bannerSchema=new mongoose.Schema({
    

    bannerName:{
        type:String,
        require:true
       
    },
    description:{
        type:String,
        require:true,
       
   }, 
   images: {
    type: Array,
  },
     
  })
  
  module.exports = mongoose.model('Banner',bannerSchema)