




/***************************************************************************** Error Message *******************************************************/

const { validateBookTitle } = require("../validator/validations")










const processBookCreateRequest = async (req,res,next)=>{
    

    if(!req.body) return res.status(400).send({status:false,message:"Inavlid Request"})


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
     






    errorMsg = {}
    errorMsg.title = req.body.title===undefined?global.req:validateBookTitle(req.body.title)
    errorMsg.excerpt = req.body.excerpt===undefined?global.req:isValid(req.body.excerpt)
    errorMsg.userId = req.body.userId===undefined?global.req:isValidObjectId(req.body.userId)
    errorMsg.category = req.body.category===undefined?global.req:isValidName(req.body.category)
    errorMsg.ISBN = req.body.ISBN===undefined?global.req:isValidISBN(req.body.ISBN)
    errorMsg.title = req.body.title===undefined?global.req:validateBookTitle(req.body.title)



}