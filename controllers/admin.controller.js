const BlogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
const ChallengeModel = require("../models/challenges.model");
const path = require('path');
const { PutObjectCommand , DeleteObjectCommand } = require("@aws-sdk/client-s3")
const sharp = require('sharp');
const { client } = require("../utils/aws.s3");
const PlanModel = require("../models/plan.model");
const { getLoggedInUserId } = require("../utils/auth.utils");

const getQueries = async (req,res) => {
    try {
      const queries = await QueryModel.find();
      res.status(200).json({success:true,queries})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while fetching the queries."})
    }
}

const createBlog = async (req, res) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const { title, content } = req.body;
  
  res.set('Content-Type', 'application/json');

  const filename = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname)

  if (!title || !content || !req.file) {
      return res.status(400).json({ message: "Please provide all the required fields." });
  }

  try {
      const userId = getLoggedInUserId(req);
      const date = new Date();

      const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'contain' }).toBuffer()

      const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `uploads/blogs/${filename}`,
          Body: buffer,
          ContentType: req.file.mimetype,
      }

      const command = new PutObjectCommand(params);

      try{
        await client.send(command);
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Failed to upload image.' });
      }

      await BlogModel.create({
          creator: userId,
          title: title,
          content: content,
          createdAt: date,
          tile_image: `uploads/blogs/${filename}`
      });

      res.status(200).json({ success: true, message: "Blog posted successfully." });
  } catch (err) {
      console.error('Error occurred while posting the blog:', err);
      res.status(500).json({ message: "Some error occurred while posting the blog." });
  }
};

  const updateBlog = async (req,res) => {
    try {
      const blogId = req.params.blogId;
      const { title,content } = req.body;
      const blog = await BlogModel.findById(blogId);
      if(title !== undefined){
        blog.title = title;
      }
      if(content !== undefined){
        blog.content = content;
      }
      await blog.save();
      res.status(200).json({success:true,message:"Blog updated successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while updating the blog."})
    }
  }

  const deleteBlog = async (req,res) => {
    try {
      const blogId = req.params.blogId;
      await BlogModel.findById(blogId);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }
      const command = new DeleteObjectCommand(params);
      try{
        await client.send(command);
      }
      catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Failed to delete image.' });
      }
      await BlogModel.findByIdAndDelete(blogId);
      res.status(200).json({success:true,message:"Blog deleted successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while deleting the blog."})
    }
  }

  const createPlan = async(req,res) => { 
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const { name, description, price } = req.body;
    const features = req.body.features.split(",");
    res.set('Content-Type', 'application/json');
    const filename = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname)
    

    if (!name || !description || !price || !features || !req.file) {
        return res.status(400).json({ message: "Please provide all the required fields." });
    }

    try {
        const key = `uploads/plans/${filename}`;

        const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'contain' }).toBuffer()

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: req.file.mimetype,
        }

        const command = new PutObjectCommand(params);

        try{
          await client.send(command);
        }
        catch (err) {
          console.log(err);
          return res.status(500).json({ message: 'Failed to upload image.' });
        }

        await PlanModel.create({
            name: name,
            description: description,
            price: price,
            features: features,
            tile_image: key
        });

        res.status(200).json({ success: true, message: "Plan created successfully." });
    } catch (err) {
        console.error('Error occurred while creating the plan:', err);
        res.status(500).json({ message: "Some error occurred while creating the plan." });
    }
  }

  const updatePlan = async(req,res) => {
    try {
      const planId = req.params.planId;
      const { name,description,price,features } = req.body;
      const plan = await PlanModel.findById(planId);
      if(name !== undefined){
        plan.name = name;
      }
      if(description !== undefined){
        plan.description = description;
      }
      if(price !== undefined){
        plan.price = price;
      }
      if(features !== undefined){
        plan.features = features.split(",");
      }
      await plan.save();
      res.status(200).json({success:true,message:"Plan updated successfully."})
    }
    catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while updating the plan."})
    }
  }

  const deletePlan = async(req,res) => {
    try {
      const planId = req.params.planId;
      await PlanModel.findById(planId);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }
      const command = new DeleteObjectCommand(params);
      try{
        await client.send(command);
      }
      catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Failed to delete image.' });
      }
      await PlanModel.findByIdAndDelete(planId);
      res.status(200).json({success:true,message:"Plan deleted successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while deleting the plan."})
    }
  }

  const createChallenges = async(req,res) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const { title,description } = req.body;
    const exercises = req.body.exercises.split(",");
    res.set('Content-Type', 'application/json');
    const filename = req.file.fieldname + '-' + uniqueSuffix + path.extname(req.file.originalname)
    try {
      const key = `uploads/challenges/${filename}`;
      const buffer = await sharp(req.file.buffer).resize({ width: 500, height: 500, fit: 'contain' }).toBuffer()
      const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: req.file.mimetype,
      }
      const command = new PutObjectCommand(params);
      try{
        await client.send(command);
      }
      catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Failed to upload image.' });
      }
      await ChallengeModel.create({
          title: title,
          description: description,
          exercises: exercises,
          tile_image: key
      });
      res.status(200).json({ success: true, message: "Challenge created successfully." });
    }
    catch (err) {
        console.error('Error occurred while creating the challenge:', err);
        res.status(500).json({ message: "Some error occurred while creating the challenge." });
    }
  }

  const updateChallenges = async(req,res) => {
    try {
      const challengeId = req.params.challengeId;
      const { title,description,exercises } = req.body;
      const challenge = await ChallengeModel.findById(challengeId);
      if(title !== undefined){
        challenge.title = title;
      }
      if(description !== undefined){
        challenge.description = description;
      }
      if(exercises !== undefined){
        challenge.exercises = exercises.split(",");
      }
      await challenge.save();
      res.status(200).json({success:true,message:"Challenge updated successfully."})
    }
    catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while updating the challenge."})
    }
  }

  const deleteChallenges = async(req,res) => {
    try {
      const challengeId = req.params.challengeId;
      await ChallengeModel.findById(challengeId);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }
      const command = new DeleteObjectCommand(params);
      try{
        await client.send(command);
      }
      catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Failed to delete image.' });
      }
      await ChallengeModel.findByIdAndDelete(challengeId);

      res.status(200).json({success:true,message:"Challenge deleted successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while deleting the challenge."})
    }
  }

  module.exports = {
    getQueries,
    createBlog,
    updateBlog,
    deleteBlog,
    createPlan,
    updatePlan,
    deletePlan,
    createChallenges,
    updateChallenges,
    deleteChallenges
  };