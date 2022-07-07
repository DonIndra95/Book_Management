const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const { isValidObjectId } = require("mongoose");
const validators = require('../validator/validations')








const createReview = async (req,res)=>{

    try {

        


        if(!validators.isValidRequest(req.body)) return res.status(400).send({status:false,message:"Bad Request"});

    let review = {};
    review.reviewedAt = Date.now();
    if(!req.params.bookId || !isValidObjectId(req.params.bookId))  return res.status(400).send({status:false,message:"Invalid BookId"})
    if(!req.body.rating || !(Number(req.body.rating)>=1 && Number(req.body.rating)<=5))  return res.status(400).send({status:false,message:"Invalid Rating"})
     
     

    
    if(req.body.reviewedBy) {
        req.body.reviewedBy = req.body.reviewedBy.split(" ").filter(e=>e).join(" ");
        if(validators.isValidName(req.body.reviewedBy)) 
           review.reviewedBy = req.body.reviewedBy
        else
         return res.status(400).send({status:false,message:"Invalid reviewer Name"})
    }
    if(req.body.review) {
        if(validators.isValid(req.body.review)) 
           review.review = req.body.review.split(" ").filter(e=>e).join(" ")
        else
         return res.status(400).send({status:false,message:"Invalid review"})
    }
    

    if(!await bookModel.findOne({_id:req.params.bookId,isDeleted:false}))
        return res.status(404).send({status:false,message:"BookId Not Exist"})


    review.bookId = req.params.bookId;
    review.rating = Math.round(req.body.rating);
    
    
    
    let data = await reviewModel.updateOne({rating:review.rating,reviewedBy:review.reviewedBy},review,{upsert:true,new:true});
    let book = await bookModel.findOne({_id:review.bookId},{__v:0,ISBN:0});
       if(data.matchedCount===0)
           book = await bookModel.findOneAndUpdate({_id:review.bookId},{ $inc: { reviews: 1 } },{new:true});
    book._doc.reviewsData = await reviewModel.find({bookId:book._id},{__v:0})
    res.status(201).send({status:true,message:"Books List", data:book})
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }





}



const reviewDeleteById = async (req,res)=>{
    if(!req.params.bookId || !isValidObjectId(req.params.bookId))  return res.status(400).send({status:false,message:"Invalid BookId"})
    if(!req.params.reviewId || !isValidObjectId(req.params.reviewId))  return res.status(400).send({status:false,message:"Invalid ReviewId"})




if(!await bookModel.findOne({_id:req.params.bookId,isDeleted:false}))
        return res.status(404).send({status:false,message:"BookId Not Exist"})


if(!await reviewModel.findOne({_id:req.params.reviewId,isDeleted:false}))
        return res.status(404).send({status:false,message:"ReviewId Not Exist"})


    let data = await reviewModel.updateOne({_id:req.params.reviewId,bookId:req.params.bookId,isDeleted:false},{isDeleted:true});

    if(data.matchedCount===0) 
    return res.status(500).send({ status: false, message: err.message });







    book = await bookModel.findOneAndUpdate({_id:review.bookId},{ $inc: { reviews: -1 } },{new:true});
   
}





module.exports.createReview = createReview