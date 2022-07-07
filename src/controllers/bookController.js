const { isValidObjectId } = require("mongoose");
const bookModel=require("../models/bookModel");
const { isValidRequest, isValid, isValidISBN, isValidName, convertToArray } = require("../validator/validations");

const createBook=async function (req,res){
    try{
        // Validating request body
        if(!isValidRequest(req.body))
        return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

        let {title,excerpt,userId,ISBN,category,subcategory,releasedAt}=req.body
        let book={}
        
        if(!title)return res.status(400).send({status:false,message:"Please enter title"})
         if(!isValid(title))return res.status(400).send({status:false,message:"Please enter valid title"})
         book.title=title; 

         if(!excerpt)return res.status(400).send({status:false,message:"Please enter excerpt"})
         if(!isValid(excerpt))return res.status(400).send({status:false,message:"Please enter valid excerpt"})
         book.excerpt=excerpt

         if(!userId)return res.status(400).send({status:false,message:"Please enter userId"})
         if(!isValidObjectId(userId))return res.status(400).send({status:false,message:"Please enter valid userId"})

        if(userId != req.token.userId)return res.status(403).send({status:false,message:"You are not authorized"})
        book.userId=userId

        if(!ISBN)return res.status(400).send({status:false,message:"Please enter ISBN"})
        if(!isValidISBN(ISBN))return res.status(400).send({status:false,message:"Please enter valid ISBN "})
         let checkISBN= await bookModel.findOne({ISBN:ISBN})
         if(checkISBN)return res.status(409).send({status:false,message:`${ISBN} already exist`})
         book.ISBN=ISBN

        if(!category) return res.status(400).send({status:false,message:"Please enter category"})
        if(!isValidName(category))return res.status(400).send({status:false,message:"Please enter valid Category"})
        book.category=category

        if(!subcategory)return res.status(400).send({status:false,message:"Please enter subcategory"})
        if(subcategory){
            let sub=convertToArray(subcategory)
            if(!sub)return res.status(400).send({status:false,message:"Please enter valid subcategory"})
            book.subcategory=sub;
        }

        if(!releasedAt)return res.status(400).send({status:false,message:"Please enter release date"})
        if(releasedAt!=moment.format("YYYY-MM-DD"))return res.status(400).send({status:false,message:"Please enter release date in YYY-MM-DD format"})      
         




    }catch(err){
        return res.status(500).send({ status: false, message: err.message });
    }
}

module.exports={
    createBook
}