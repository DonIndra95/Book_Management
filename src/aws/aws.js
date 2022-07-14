const aws=require("aws-sdk")

let uploadFile=(file)=>{    
    return new Promise((resolve,reject)=>{
    let s3=new aws.S3({apiversion:'2006-03-01'});
    var uploadParams={
        ACL:"public-read",
        Bucket:"classroom-training-bucket",
        Key:"book-covers-26/"+Date.now()+file.originalname,
        Body:file.buffer
    }
    s3.upload(uploadParams,function (err,data){
        if(err)return reject({error:err.message})
        return resolve(data.Location)
    })})
}
    
module.exports={uploadFile}