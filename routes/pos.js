const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const Order = require('../models/Order')

function isEmployee(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  if (req.session.user.role === 'customer') return res.redirect('/shop')
  next()
}

// หน้า POS
router.get('/', isEmployee, async (req, res) => {
  try {
    const { search, category } = req.query
    let query = { isActive: true, stock: { $gt: 0 } }
    if (search) query.name = { $regex: search, $options: 'i' }
    if (category && category !== 'all') query.category = category
    const products = await Product.find(query).sort({ name: 1 })
    const categories = await Product.distinct('category', { isActive: true })
    res.render('pos/index', { products, categories, search: search || '', selectedCategory: category || 'all', success: req.query.success || null, error: req.query.error || null })
  } catch (err) {
    res.render('pos/index', { products: [], categories: [], search: '', selectedCategory: 'all', success: null, error: 'โหลดสินค้าไม่สำเร็จ' })
  }
})

// พนักงานบันทึกการขายผ่าน POS
router.post('/sale', isEmployee, async (req, res) => {
  try {
    const { items, paymentMethod, note, customerName } = req.body
    let cartItems = typeof items === 'string' ? JSON.parse(items) : items
    if (!cartItems || cartItems.length === 0) return res.redirect('/pos?error=ไม่มีสินค้า')

    let totalAmount = 0
    let orderItems = []
    for (const item of cartItems) {
      const product = await Product.findById(item.productId)
      if (!product) continue
      if (product.stock < item.quantity) return res.redirect('/pos?error=สินค้า ' + product.name + ' มีไม่พอ')
      const subtotal = product.price * item.quantity
      totalAmount += subtotal
      orderItems.push({ product: product._id, productName: product.name, price: product.price, quantity: item.quantity, subtotal })
      product.stock -= item.quantity
      await product.save()
    }

    const order = new Order({
      customer: req.session.user._id,
      customerName: customerName || 'ลูกค้าหน้าร้าน',
      employee: req.session.user._id,
      employeeName: req.session.user.displayName || req.session.user.username,
      items: orderItems, totalAmount,
      paymentMethod: paymentMethod || 'เงินสด',
      note: note || '',
      status: 'completed'
    })
    await order.save()
    res.redirect('/orders/receipt/' + order._id)
  } catch (err) {
    console.log(err)
    res.redirect('/pos?error=เกิดข้อผิดพลาด')
  }
})

module.exports = router
