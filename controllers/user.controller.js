const UserModel = require('../models/user.model')
const { getLoggedInUserId } = require('../utils/auth.utils')

const editProfile = async (req,res) => {
  try {
    const userId = getLoggedInUserId(req);
    const { name, dob, phoneNumber } = req.body;
    const user = await UserModel.findById(userId);
    if(name !== undefined){
      user.name = name;
    }
    if(dob !== undefined){
      user.date_of_birth = dob;
    }
    if(phoneNumber !== undefined){
      user.phone_number = phoneNumber;
    }
    await user.save();
    res.status(200).json({success:true,message:"Profile updated successfully."})
  } catch (err) {
    console.log(err)
    res.status(500).json({message:"Some error occured while updating the profile."})
  }
}

module.exports = {
  editProfile,
}