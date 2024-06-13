const BlogModel = require("../models/blog.model");
const UserModel = require("../models/user.model");
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

const createBlog = async (req,res) => {
    const { title,content } = req.body ;
    try{
      const userId = getLoggedInUserId(req);
      const date = new Date();
      await BlogModel.create({
        creator: userId,
        title: title,
        content: content,
        createdAt: date
      })
      res.status(200).json({success:true , message:"blog posted successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some erorr occured while posting the blog."})
    }
}

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