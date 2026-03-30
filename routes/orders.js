const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const Product = require('../models/Product')

function isLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  next()
}

function isStaff(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  if (req.session.user.role === 'customer') return res.redirect('/shop')
  next()
}

// หน้ารายการ orders
router.get('/', isLogin, async (req, res) => {
  try {
    let orders
    if (req.session.user.role === 'manager') {
      orders = await Order.find().sort({ createdAt: -1 }).limit(100)
    } else if (req.session.user.role === 'employee') {
      orders = await Order.find({
        $or: [
          { employee: req.session.user._id },
          { status: 'pending' }
        ]
      }).sort({ createdAt: -1 })
    } else {
      orders = await Order.find({ customer: req.session.user._id }).sort({ createdAt: -1 })
    }
    res.render('orders/index', { orders, user: req.session.user })
  } catch (err) {
    res.render('orders/index', { orders: [], user: req.session.user })
  }
})

router.get('/receipt/:id', isLogin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.redirect('/')
    if (req.session.user.role === 'customer') {
      if (order.customer.toString() !== req.session.user._id.toString()) {
        return res.redirect('/shop')
      }
    }
    res.render('orders/receipt', { order })
  } catch (err) {
    res.redirect('/')
  }
})

// ลูกค้าสั่งซื้อสินค้า (pending)
router.post('/checkout', isLogin, async (req, res) => {
  try {
    const { items, paymentMethod, note } = req.body
    let cartItems = []
    if (typeof items === 'string') { cartItems = JSON.parse(items) } else { cartItems = items }
    if (!cartItems || cartItems.length === 0) { return res.redirect('/shop?error=ไม่มีสินค้าในตะกร้า') }

    let totalAmount = 0
    let orderItems = []
    for (const item of cartItems) {
      const product = await Product.findById(item.productId)
      if (!product) continue
      if (product.stock < item.quantity) { return res.redirect('/shop?error=สินค้า ' + product.name + ' มีไม่พอ') }
      const subtotal = product.price * item.quantity
      totalAmount += subtotal
      orderItems.push({ product: product._id, productName: product.name, price: product.price, quantity: item.quantity, subtotal })
      product.stock -= item.quantity
      await product.save()
    }

    const order = new Order({
      customer: req.session.user._id,
      customerName: req.session.user.displayName || req.session.user.username,
      items: orderItems, totalAmount,
      paymentMethod: paymentMethod || 'เงินสด',
      note: note || '',
      status: 'pending'
    })
    await order.save()
    res.redirect('/orders/receipt/' + order._id)
  } catch (err) {
    console.log(err)
    res.redirect('/shop?error=เกิดข้อผิดพลาดในการสั่งซื้อ')
  }
})

// พนักงานรับออเดอร์
router.post('/accept/:id', isStaff, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order || order.status !== 'pending') return res.redirect('/orders')
    order.status = 'accepted'
    order.employee = req.session.user._id
    order.employeeName = req.session.user.displayName || req.session.user.username
    await order.save()
    res.redirect('/orders')
  } catch (err) { res.redirect('/orders') }
})

// พนักงานทำออเดอร์เสร็จ
router.post('/complete/:id', isStaff, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.redirect('/orders')
    if (req.session.user.role === 'employee' && order.employee && order.employee.toString() !== req.session.user._id.toString()) {
      return res.redirect('/orders')
    }
    order.status = 'completed'
    if (!order.employee) {
      order.employee = req.session.user._id
      order.employeeName = req.session.user.displayName || req.session.user.username
    }
    await order.save()
    res.redirect('/orders/receipt/' + order._id)
  } catch (err) { res.redirect('/orders') }
})

// ยกเลิกออเดอร์
router.post('/cancel/:id', isStaff, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.redirect('/orders')
    for (const item of order.items) {
      if (item.product) { await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }) }
    }
    order.status = 'cancelled'
    await order.save()
    res.redirect('/orders')
  } catch (err) { res.redirect('/orders') }
})

module.exports = router
