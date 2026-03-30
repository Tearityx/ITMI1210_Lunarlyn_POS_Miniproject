const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lunarlyn_pos'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing data
  const User = require('./models/User')
  const Product = require('./models/Product')

  // สร้าง users
  const users = [
    {
      username: 'manager',
      password: '1234',
      displayName: 'ผู้จัดการร้าน',
      email: 'manager@lunarlyn.com',
      phone: '081-000-0001',
      role: 'manager'
    },
    {
      username: 'employee1',
      password: '1234',
      displayName: 'พนักงาน ก.',
      email: 'emp1@lunarlyn.com',
      phone: '082-000-0001',
      role: 'employee'
    },
    {
      username: 'customer1',
      password: '1234',
      displayName: 'ลูกค้าทดสอบ',
      email: 'customer@test.com',
      phone: '083-000-0001',
      role: 'customer'
    }
  ]

  for (const u of users) {
    const exist = await User.findOne({ username: u.username })
    if (!exist) {
      await User.create(u)
      console.log('Created user:', u.username)
    }
  }


  console.log('\n✅ Seed เสร็จสิ้น!')
  console.log('บัญชีทดสอบ:')
  console.log('  manager / 1234 - ผู้จัดการ')
  console.log('  employee1 / 1234 - พนักงาน')
  console.log('  customer1 / 1234 - ลูกค้า')

  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
