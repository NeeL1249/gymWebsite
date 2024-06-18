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

  module.exports = {
    getQueries,
    createBlog,
    updateBlog,
    deleteBlog
  };