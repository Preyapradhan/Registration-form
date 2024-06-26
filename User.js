const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactno: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  qualification: { type: String, required: true },
  file: {
    path: { type: String, required: true },
    sizeKB: { type: Number, required: true }
  },
});

module.exports = mongoose.model('User', userSchema);
