const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  displayName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['manager', 'employee', 'customer'], default: 'customer' },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

// hash รหัสก่อนบันทึก
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// เช็ครหัสผ่าน
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)

