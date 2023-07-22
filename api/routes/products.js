const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth")




const storage =  multer.diskStorage({
    destination: function (req , file , cb)  {
        cb(null ,"./uploads/");
    },
    filename: function(req , file , cb){
        cb(null , new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });






const Product = require("../models/product")




router.get("/", (req,res , next)=>{
    Product.find()
    .select("name price _id productImage url")
    .exec()
    .then( docs=>{

        const response = {
            count: docs.length,
            product: docs.map(doc=>{
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage : doc.productImage,
                    _id: doc._id,
                    url:req.body.url,
                    request:{
                        type: "GET",
                        url : "http://localhost:3000/product/"+ doc._id
                    }
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

router.post("/", upload.single("productImage"),(req,res , next)=>{
    console.log(req.file)
    const product = Product({
    _id: new mongoose.Types.ObjectId,
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
    url:req.body.url
  });
   product
   .save()
   .then(result =>{
    console.log(res);
    res.status(201).json({
        message : "Created Object Success",
        createdproduct : {
            name: result.name,
            price : result.price,
            _id: result._id,
            url:result.url,
            request:{
                type: "GET",
                url : "http://localhost:3000/product/"+ result._id
            }
        }
    });
   })
   .catch(err=> {
    console.log(err)
    res.status(500).json({
        error: err
    })
   })
  
});

router.get("/:id", (req,res , next)=>{
    const id = req.params.id
    Product.findById(id)
    .select("name price _id productImage")
    .exec()
    .then(doc=> {
        console.log("from database",doc)
        if(doc){
            res.status(200).json({
                product: doc,
                request:{
                    type: "GET",
                    url : "http://localhost:3000/product/"
                }
            });
        }else{
            res.status(404).json({
                message:" no valid entry found"
            })
        }
    })
    .catch(err=> {
        console.log(err)
        res.status(500).json({
            error:err
        })
    });
})



router.patch("/:id", (req,res , next)=>{
    const id = req.params.id
    const updateops =  {};
    for(const ops of req.body){
        updateops[ops.propName] = ops.value
    }
    Product.updateOne({_id: id},{ $set: updateops })
    .exec()
    .then(result=>{
        res.status(200).json({
            message: "Product Updated",
            request:{
                type: "GET",
                url : "http://localhost:3000/product/" + id
            }
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
    
})

router.delete("/:productid", (req,res , next)=>{
    const id = req.params.productid
    Product.deleteOne({
        _id : id
    })
    .exec()
    .then(result=>{
        res.status(200).json({
            message: "Product deleted",
            request:{
                type : "POST",
                url : "http://localhost:3000/product/",
                body :{name: "String" , price: "Number"}
            }
        })
    })
    .catch(err=>{
        console.log(err)
        res.status(500).json({
            error :err
        })
    })

})



module.exports = router;