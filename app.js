const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const path = require('path')
const multer = require('multer')
const Settings = require('./models/Settings')

const app = express()
const PORT = process.env.PORT || 8080

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lunarlyn_pos'
mongoose.connect(MONGO_URI)
  .then(() => console.log('เชื่อมต่อ MongoDB สำเร็จ'))
  .catch(err => console.log('เชื่อมต่อ MongoDB ไม่สำเร็จ:', err))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: process.env.SESSION_SECRET || 'lunarlyn-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

// middleware ส่ง user และ shopLogo ไปให้ทุก view
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null
  try {
    const logoSetting = await Settings.findOne({ key: 'shopLogo' })
    res.locals.shopLogo = logoSetting ? logoSetting.value : ''
  } catch (e) {
    res.locals.shopLogo = ''
  }
  next()
})

// routes
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/users')
const orderRoutes = require('./routes/orders')
const dashboardRoutes = require('./routes/dashboard')
const shopRoutes = require('./routes/shop')
const posRoutes = require('./routes/pos')
const settingsRoutes = require('./routes/settings')

app.use('/', authRoutes)
app.use('/products', productRoutes)
app.use('/users', userRoutes)
app.use('/orders', orderRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/shop', shopRoutes)
app.use('/pos', posRoutes)
app.use('/settings', settingsRoutes)

app.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'customer') return res.redirect('/shop')
    return res.redirect('/dashboard')
  }
  res.redirect('/login')
})

app.listen(PORT, () => {
  console.log(`Lunarlyn IT POS รันอยู่ที่ port ${PORT}`)
})
