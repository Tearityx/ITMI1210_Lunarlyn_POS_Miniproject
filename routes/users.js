const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

// ตั้งค่า multer สำหรับรูปโปรไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/profiles'))
  },
  filename: (req, file, cb) => {
    cb(null, 'profile_' + Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } })

// เช็คสิทธิ์ login
function isLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  next()
}

// เช็คว่าเป็น manager
function isManager(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  if (req.session.user.role !== 'manager') return res.redirect('/dashboard')
  next()
}

// หน้าจัดการพนักงาน (manager เท่านั้น)
router.get('/', isManager, async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'manager'] } }).sort({ createdAt: -1 })
    res.render('users/index', { employees, success: req.query.success || null, error: null })
  } catch (err) {
    res.render('users/index', { employees: [], success: null, error: 'โหลดข้อมูลไม่สำเร็จ' })
  }
})

// หน้าจัดการลูกค้า (manager เท่านั้น)
router.get('/customers', isManager, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 })
    res.render('users/customers', { customers, success: req.query.success || null, error: null })
  } catch (err) {
    res.render('users/customers', { customers: [], success: null, error: 'โหลดข้อมูลไม่สำเร็จ' })
  }
})

// หน้าเพิ่มพนักงาน
router.get('/add', isManager, (req, res) => {
  res.render('users/form', { employee: null, error: null, action: 'add' })
})

// บันทึกพนักงานใหม่
router.post('/add', isManager, async (req, res) => {
  const { username, password, displayName, email, phone, role } = req.body
  try {
    const exist = await User.findOne({ username })
    if (exist) return res.render('users/form', { employee: null, error: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว', action: 'add' })

    const user = new User({
      username, password, displayName, email, phone,
      role: role || 'employee'
    })
    await user.save()
    res.redirect('/users?success=เพิ่มพนักงานสำเร็จ')
  } catch (err) {
    res.render('users/form', { employee: null, error: 'เกิดข้อผิดพลาด', action: 'add' })
  }
})

// หน้าแก้ไขพนักงาน
router.get('/edit/:id', isManager, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
    if (!employee) return res.redirect('/users')
    res.render('users/form', { employee, error: null, action: 'edit' })
  } catch (err) {
    res.redirect('/users')
  }
})

// บันทึกการแก้ไขพนักงาน
router.post('/edit/:id', isManager, async (req, res) => {
  const { displayName, email, phone, role, password } = req.body
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.redirect('/users')

    user.displayName = displayName
    user.email = email
    user.phone = phone
    user.role = role

    if (password && password.trim() !== '') {
      user.password = password
    }

    await user.save()
    res.redirect('/users?success=แก้ไขข้อมูลพนักงานสำเร็จ')
  } catch (err) {
    res.redirect('/users')
  }
})

// ลบพนักงาน
router.post('/delete/:id', isManager, async (req, res) => {
  try {
    if (req.params.id === req.session.user._id.toString()) {
      return res.redirect('/users?success=ไม่สามารถลบบัญชีตัวเองได้')
    }
    await User.findByIdAndDelete(req.params.id)
    res.redirect('/users?success=ลบพนักงานสำเร็จ')
  } catch (err) {
    res.redirect('/users')
  }
})

// หน้าแก้ไข Profile ของตัวเอง
router.get('/profile', isLogin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    res.render('users/profile', { userInfo: user, success: req.query.success || null, error: null })
  } catch (err) {
    res.redirect('/dashboard')
  }
})

// บันทึกการแก้ไข Profile
router.post('/profile', isLogin, upload.single('profileImage'), async (req, res) => {
  const { displayName, email, phone, address, password, confirmPassword } = req.body
  try {
    const user = await User.findById(req.session.user._id)
    if (!user) return res.redirect('/logout')

    user.displayName = displayName
    user.email = email
    user.phone = phone
    user.address = address

    if (password && password.trim() !== '') {
      if (password !== confirmPassword) {
        return res.render('users/profile', { userInfo: user, error: 'รหัสผ่านใหม่ไม่ตรงกัน', success: null })
      }
      user.password = password
    }

    if (req.file) {
      if (user.profileImage) {
        const oldPath = path.join(__dirname, '../public', user.profileImage)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      user.profileImage = '/uploads/profiles/' + req.file.filename
    }

    await user.save()

    // อัปเดต session
    req.session.user.displayName = user.displayName
    req.session.user.profileImage = user.profileImage

    res.redirect('/users/profile?success=แก้ไขข้อมูลสำเร็จ')
  } catch (err) {
    res.redirect('/users/profile')
  }
})

module.exports = router
