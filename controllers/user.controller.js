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


const changePassword = async (req,res) => {
  try {
    const userId = getLoggedInUserId(req);
    const { oldPassword, newPassword } = req.body;
    const user = await UserModel.findById(userId);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect Password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "An error occurred while changing the password" });
  }
}


module.exports = {
  editProfile,
  changePassword
}