const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Product = require('../models/Product')

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, path.join(__dirname, '../public/uploads/products')) },
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)) }
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

function isStaff(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  if (req.session.user.role === 'customer') return res.redirect('/shop')
  next()
}

// รายการสินค้า (staff ทุกคน)
router.get('/', isStaff, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.render('products/index', { products, success: req.query.success || null, error: null })
  } catch (err) {
    res.render('products/index', { products: [], success: null, error: 'โหลดข้อมูลไม่สำเร็จ' })
  }
})

// หน้าเพิ่มสินค้า (staff ทุกคน)
router.get('/add', isStaff, (req, res) => {
  res.render('products/form', { product: null, error: null, action: 'add' })
})

// บันทึกสินค้าใหม่ (staff ทุกคน)
router.post('/add', isStaff, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category } = req.body
  try {
    const product = new Product({
      name, description, price: parseFloat(price), stock: parseInt(stock), category,
      image: req.file ? '/uploads/products/' + req.file.filename : ''
    })
    await product.save()
    res.redirect('/products?success=เพิ่มสินค้าสำเร็จ')
  } catch (err) {
    res.render('products/form', { product: null, error: 'เกิดข้อผิดพลาด', action: 'add' })
  }
})

// หน้าแก้ไขสินค้า (staff ทุกคน)
router.get('/edit/:id', isStaff, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.redirect('/products')
    res.render('products/form', { product, error: null, action: 'edit' })
  } catch (err) { res.redirect('/products') }
})

// บันทึกการแก้ไขสินค้า (staff ทุกคน)
router.post('/edit/:id', isStaff, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category, isActive } = req.body
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.redirect('/products')
    product.name = name
    product.description = description
    product.price = parseFloat(price)
    product.stock = parseInt(stock)
    product.category = category
    product.isActive = isActive === 'on' ? true : false
    if (req.file) {
      if (product.image) {
        const oldPath = path.join(__dirname, '../public', product.image)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
      product.image = '/uploads/products/' + req.file.filename
    }
    await product.save()
    res.redirect('/products?success=แก้ไขสินค้าสำเร็จ')
  } catch (err) { res.redirect('/products') }
})

// ลบสินค้า (staff ทุกคน)
router.post('/delete/:id', isStaff, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product && product.image) {
      const imgPath = path.join(__dirname, '../public', product.image)
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath)
    }
    await Product.findByIdAndDelete(req.params.id)
    res.redirect('/products?success=ลบสินค้าสำเร็จ')
  } catch (err) { res.redirect('/products') }
})

module.exports = router
