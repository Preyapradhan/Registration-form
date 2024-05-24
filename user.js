const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const router = express.Router();
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit
});


router.post('/register', upload.single('file'), async (req, res) => {
  try {
    const { firstName, lastName, contactno, gender, email, qualification } = req.body;
    const file = {
      path: req.file.path,
      sizeKB: Math.round(req.file.size / 1024) // Calculate file size in KB
    };

    const user = new User({ firstName, lastName, contactno, gender, email, qualification, file });
    await user.save();

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/uploads/:filename', (req,res)=>{
  const filepath = path.join(__dirname, 'uploads',req.params.filename);
  fs.access(filepath, fs.constants.F_OK, (err)=>{
    if(err){
      res.status(404).json("File Not found");
    }
    else{
      res.sendFile(filepath);
    }
  });
});

const getUserWithFileSize = async (user) => {
  try {
    const stats = fs.statSync(user.file);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2); // Convert bytes to KB with 2 decimal places
    return {
      ...user.toObject(),
      fileSize: fileSizeInKB
    };
  } catch (error) {
    console.error("Error calculating file size:", error);
    return null;
  }
};

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    const usersWithFileSize = await Promise.all(users.map(user => getUserWithFileSize(user)));
    res.json(usersWithFileSize);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.put('/users/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, contactno, gender, email, qualification } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.contactno = contactno;
    user.gender = gender;
    user.email = email;
    user.qualification = qualification;

    // If a new file is uploaded, update the file details
    if (req.file) {
      // Delete the old file if exists
      if (user.file && user.file.path) {
        fs.unlinkSync(user.file.path);
      }
      user.file = {
        path: req.file.path,
        sizeKB: Math.round(req.file.size / 1024), // Calculate file size in KB
      };
    }

    // Save the updated user
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
