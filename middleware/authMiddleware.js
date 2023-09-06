const jwt=require('jsonwebtoken');
const User  = require('../model/userModel')




const authMiddleware = async(req,res,next)=>{
    let token
    if(req?.headers?.authorization?.startsWith("Bearer")){
        token = req?.headers?.authorization?.split(" ")[1]
        try{
            if(token){
                const decode = jwt.verify(token , "group09")
                // console.log( "decode" ,decode)
                const user = await User.findById(decode?.userId)
                // console.log("user", user)
                req.user = user;
                
                next()
            }
        }catch(err){
            res.status(401).send({msg: "Not authorised , Please Login Again"})
        }
    } else{
        res.status(400).send({msg: "There is no token attached to the header"})
    }
}


module.exports = { authMiddleware  }