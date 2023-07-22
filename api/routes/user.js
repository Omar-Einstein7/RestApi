const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user")




router.post("/getuser" , (req,res , next)=>{
    User.find({email : req.body.email})
    .select("email password _id")
    .exec()
    .then(docs=>{

        const response = {
            count: docs.length,
            User: docs.map(doc=>{
                return {
                    _id : doc._id,
                    email: doc.email,
                    password: doc.password,
                }
            })
        };
    //    if(docs.length >= 0){
        res.status(200).json(response);

    //    }else{
    //     res.status(404).json({
    //         message:"not found"
    //     })
    //    }
})
.catch(err=>{
    console.log(err);
    res.status(500).json({
        error:err
    }) 
}
)
})


router.post("/signup", (req, res, next) => {

    User.find({ email: req.body.email })
    .exec()
    .then(user=>{
        if(user.length >= 1){
            console.log(user);
            return res.status(409).json({
                message: "Email Exiest"
            })
        }else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        name : req.body.name,
                        email: req.body.email,
                        password: hash
                    });
                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: "User created",
                                
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                }
            })
        }
    })
});

router.post("/login" , (req , res , next)=>{
    User.find({email : req.body.email })
    .exec()
    .then(user=>{
        if(user.length < 1 ){
            return res.status(401).json({
                message: "Auth Failed"

            });
        }
        bcrypt.compare(req.body.password , user[0].password , (err , result)=>{
            if(err){
                return res.status(401).json({
                    message: "Auth Failed"
    
                });
            }
            if(result){
                const token =jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id,
                },
                "secret",
                {
                    expiresIn: "1h"
                }
                )
                return res.status(200).json({
                    message: "Auth Successful",
                    token: token,   
                    
                    
                });
            }
            return res.status(401).json({
                message: "Auth Failed"

            });
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
})



router.delete("/:userId", (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: "User deleted"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


module.exports = router;