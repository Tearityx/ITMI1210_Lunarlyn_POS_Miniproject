const express = require('express')
const router = express.Router()
const Product = require('../models/Product')

function isCustomer(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  next()
}

// หน้าร้านค้า
router.get('/', isCustomer, async (req, res) => {
  try {
    const { search, category } = req.query
    let query = { isActive: true, stock: { $gt: 0 } }

    if (search) query.name = { $regex: search, $options: 'i' }
    if (category && category !== 'all') query.category = category

    const products = await Product.find(query).sort({ createdAt: -1 })
    const categories = await Product.distinct('category', { isActive: true })

    res.render('shop/index', {
      products,
      categories,
      search: search || '',
      selectedCategory: category || 'all',
      error: req.query.error || null
    })
  } catch (err) {
    res.render('shop/index', { products: [], categories: [], search: '', selectedCategory: 'all', error: 'โหลดสินค้าไม่สำเร็จ' })
  }
})

// หน้าตะกร้าสินค้า
router.get('/cart', isCustomer, (req, res) => {
  res.render('shop/cart')
})

// หน้าชำระเงิน
router.get('/checkout', isCustomer, (req, res) => {
  res.render('shop/checkout')
})

module.exports = router
