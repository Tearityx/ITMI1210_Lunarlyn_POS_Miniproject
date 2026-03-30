const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Settings = require('../models/Settings')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads/logo')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => { cb(null, 'logo' + path.extname(file.originalname)) }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

function isManager(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  if (req.session.user.role !== 'manager') return res.redirect('/dashboard')
  next()
}

// อัปโหลดโลโก้
router.post('/logo', isManager, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.redirect('/dashboard?error=กรุณาเลือกไฟล์รูปภาพ')
    const logoUrl = '/uploads/logo/' + req.file.filename
    await Settings.findOneAndUpdate({ key: 'shopLogo' }, { value: logoUrl }, { upsert: true, new: true })
    res.redirect('/dashboard?success=เปลี่ยนโลโก้สำเร็จ')
  } catch (err) {
    console.log(err)
    res.redirect('/dashboard?error=เกิดข้อผิดพลาด')
  }
})

module.exports = router
