const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// send message
router.post("/", async (req,res)=>{
  try{
    const msg = await Message.create(req.body);
    res.json(msg);
  }catch(err){
    res.status(500).json({message: err.message});
  }
});

// get messages
router.get("/:user1/:user2", async (req,res)=>{
  try{

    const {user1,user2} = req.params;

    const messages = await Message.find({
      $or:[
        {sender:user1, receiver:user2},
        {sender:user2, receiver:user1}
      ]
    });

    res.json(messages);

  }catch(err){
    res.status(500).json({message: err.message});
  }
});

module.exports = router;