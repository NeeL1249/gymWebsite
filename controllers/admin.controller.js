const BlogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
const uploadImage = require('../utils/cloudinary');
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
  const { title, content } = req.body;
  
  res.set('Content-Type', 'application/json');

  if (!title || !content || !req.file) {
      return res.status(400).json({ message: "Please provide all the required fields." });
  }

  const localFilePath = req.file.path;

  try {
      const userId = getLoggedInUserId(req);
      const date = new Date();
      const imageUrl = await uploadImage(localFilePath);

      if (!imageUrl) {
          return res.status(500).json({ message: 'Failed to upload image.' });
      }

      await BlogModel.create({
          creator: userId,
          title: title,
          content: content,
          createdAt: date,
          tile_image: imageUrl
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
      await BlogModel.findByIdAndDelete(blogId);
      res.status(200).json({success:true,message:"Blog deleted successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while deleting the blog."})
    }
  }

  const createPlan = async(req,res) => { 
    const { name, description, price } = req.body;
    const features = req.body.features.split(",");
    const localFilePath = req.file.path;

    if (!name || !description || !price || !features || !req.file) {
        return res.status(400).json({ message: "Please provide all the required fields." });
    }

    try {
        const imageUrl = await uploadImage(localFilePath);

        if (!imageUrl) {
            return res.status(500).json({ message: 'Failed to upload image.' });
        }

        await PlanModel.create({
            name: name,
            description: description,
            price: price,
            features: features,
            tile_image: imageUrl
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
      await PlanModel.findByIdAndDelete(planId);
      res.status(200).json({success:true,message:"Plan deleted successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while deleting the plan."})
    }
  }

  module.exports = {
    getQueries,
    createBlog,
    updateBlog,
    deleteBlog,
    createPlan,
    updatePlan,
    deletePlan
  };