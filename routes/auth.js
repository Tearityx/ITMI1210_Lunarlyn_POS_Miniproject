const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Settings = require('../models/Settings')

// หน้า login
router.get('/login', async (req, res) => {
  if (req.session.user) return res.redirect('/')
  const logoSetting = await Settings.findOne({ key: 'shopLogo' }).catch(() => null)
  res.render('auth/login', { error: null, success: null, shopLogo: logoSetting ? logoSetting.value : '' })
})

// ส่งข้อมูล login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    const logoSetting = await Settings.findOne({ key: 'shopLogo' }).catch(() => null)
    const shopLogo = logoSetting ? logoSetting.value : ''
    if (!user) return res.render('auth/login', { error: 'ไม่พบชื่อผู้ใช้นี้', success: null, shopLogo })

    const match = await user.comparePassword(password)
    if (!match) return res.render('auth/login', { error: 'รหัสผ่านไม่ถูกต้อง', success: null, shopLogo })

    req.session.user = {
      _id: user._id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role,
      profileImage: user.profileImage
    }

    if (user.role === 'customer') return res.redirect('/shop')
    res.redirect('/dashboard')
  } catch (err) {
    res.render('auth/login', { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่', success: null, shopLogo: '' })
  }
})

// หน้าสมัครสมาชิก (สำหรับลูกค้าเท่านั้น)
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/')
  res.render('auth/register', { error: null })
})

// ส่งข้อมูลสมัครสมาชิก
router.post('/register', async (req, res) => {
  const { username, password, confirmPassword, displayName, email, phone } = req.body
  try {
    if (password !== confirmPassword) {
      return res.render('auth/register', { error: 'รหัสผ่านไม่ตรงกัน' })
    }
    const exist = await User.findOne({ username })
    if (exist) return res.render('auth/register', { error: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' })

    const user = new User({ username, password, displayName, email, phone, role: 'customer' })
    await user.save()
    const logoSetting2 = await Settings.findOne({ key: 'shopLogo' }).catch(() => null)
    res.render('auth/login', { error: null, success: 'สมัครสำเร็จ! กรุณาเข้าสู่ระบบ', shopLogo: logoSetting2 ? logoSetting2.value : '' })
  } catch (err) {
    res.render('auth/register', { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
  }
})

// logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

module.exports = router
