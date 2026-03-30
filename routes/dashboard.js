const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')

function isStaff(req, res, next) {
  if (!req.session.user) return res.redirect('/login')
  if (req.session.user.role === 'customer') return res.redirect('/shop')
  next()
}

router.get('/', isStaff, async (req, res) => {
  try {
    const user = req.session.user

    if (user.role === 'manager') {
      // ข้อมูลสรุปทั้งหมด
      const totalOrders = await Order.countDocuments({ status: 'completed' })
      const totalRevenue = await Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
      const totalCustomers = await User.countDocuments({ role: 'customer' })
      const totalProducts = await Product.countDocuments({ isActive: true })

      // ยอดขายรายพนักงาน
      const employeeSales = await Order.aggregate([
        { $match: { status: 'completed', employee: { $ne: null } } },
        { $group: {
          _id: '$employee',
          employeeName: { $first: '$employeeName' },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }},
        { $sort: { totalSales: -1 } }
      ])

      // ออเดอร์ล่าสุด
      const recentOrders = await Order.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(10)

      // สินค้าขายดี
      const topProducts = await Order.aggregate([
        { $match: { status: 'completed' } },
        { $unwind: '$items' },
        { $group: {
          _id: '$items.productName',
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }},
        { $sort: { totalQty: -1 } },
        { $limit: 5 }
      ])

      // ยอดขาย 7 วันล่าสุด
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const start = new Date(date.setHours(0, 0, 0, 0))
        const end = new Date(date.setHours(23, 59, 59, 999))

        const dayOrders = await Order.aggregate([
          { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])

        last7Days.push({
          date: start.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
          total: dayOrders[0]?.total || 0
        })
      }

      res.render('dashboard/manager', {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        totalProducts,
        employeeSales,
        recentOrders,
        topProducts,
        last7Days,
        success: req.query.success || null,
        error: req.query.error || null
      })

    } else {
      // Employee dashboard - เห็นแค่ของตัวเอง
      const myOrders = await Order.find({
        employee: user._id,
        status: { $in: ['accepted', 'completed'] }
      }).sort({ createdAt: -1 })

      const pendingCount = await Order.countDocuments({ status: 'pending' })
      const myRevenue = myOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0)

      // 7 วันล่าสุดของตัวเอง
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const start = new Date(date.setHours(0, 0, 0, 0))
        const end = new Date(date.setHours(23, 59, 59, 999))

        const dayOrders = await Order.aggregate([
          { $match: {
            employee: require('mongoose').Types.ObjectId.createFromHexString(user._id.toString()),
            status: 'completed',
            createdAt: { $gte: start, $lte: end }
          }},
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])

        last7Days.push({
          date: start.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' }),
          total: dayOrders[0]?.total || 0
        })
      }

      res.render('dashboard/employee', {
        myOrders: myOrders.slice(0, 10),
        myRevenue,
        myOrderCount: myOrders.filter(o => o.status === 'completed').length,
        pendingCount,
        last7Days
      })
    }
  } catch (err) {
    console.log(err)
    res.render('dashboard/employee', {
      myOrders: [],
      myRevenue: 0,
      myOrderCount: 0,
      pendingCount: 0,
      last7Days: []
    })
  }
})

module.exports = router
