

export const globalResponses = (err,req,res,next)=>{
    if(err){
        console.log(err);
        return res.status(err['cause']||500).json({
            errMsg: err.message
        })
    }
}