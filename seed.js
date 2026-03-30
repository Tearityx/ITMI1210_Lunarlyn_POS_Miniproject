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
  // สร้างสินค้า
  const products = [
    {
      name: 'MSI GeForce RTX 4070 SUPER 12GB',
      description: 'การ์ดจอประสิทธิภาพสูง เล่นเกม 4K ได้อย่างลื่น',
      price: 22900,
      stock: 15,
      category: 'การ์ดจอ'
    },
    {
      name: 'Intel Core i9-14900K',
      description: 'โปรเซสเซอร์รุ่นใหม่ล่าสุด ประสิทธิภาพสูงสุดในราคาสมเหตุสมผล',
      price: 18500,
      stock: 8,
      category: 'โปรเซสเซอร์'
    },
    {
      name: 'Corsair Vengeance DDR5 32GB (2x16GB)',
      description: 'แรม DDR5 ความเร็ว 6000MHz สำหรับระบบ Gen5',
      price: 5900,
      stock: 25,
      category: 'แรม'
    },
    {
      name: 'Samsung 990 Pro 2TB NVMe M.2',
      description: 'SSD ความเร็วสูง อ่าน 7450 MB/s เขียน 6900 MB/s',
      price: 8500,
      stock: 20,
      category: 'SSD/HDD'
    },
    {
      name: 'Logitech MX Master 3S',
      description: 'เมาส์ไร้สายระดับ Pro เซ็นเซอร์ 8000 DPI',
      price: 3290,
      stock: 30,
      category: 'เมาส์'
    },
    {
      name: 'Keychron K2 Pro Wireless',
      description: 'คีย์บอร์ด Mechanical ไร้สาย สวิตช์ Brown พิมพ์นุ่มมาก',
      price: 4200,
      stock: 18,
      category: 'คีย์บอร์ด'
    },
    {
      name: 'ASUS ProArt PA279CRV 27" 4K',
      description: 'จอมอนิเตอร์ 4K IPS สีแม่น ครอบคลุม 99% DCI-P3',
      price: 25900,
      stock: 6,
      category: 'จอมอนิเตอร์'
    },
    {
      name: 'Logitech G Pro X 2 Lightspeed',
      description: 'หูฟัง Gaming ไร้สาย เสียงคุณภาพสตูดิโอ',
      price: 7900,
      stock: 12,
      category: 'หูฟัง'
    },
    {
      name: 'ASUS ROG Strix B650E-F WiFi',
      description: 'เมนบอร์ด AM5 รองรับ DDR5 PCIe 5.0 WiFi 6E',
      price: 14500,
      stock: 9,
      category: 'อื่นๆ'
    },
    {
      name: 'Seasonic Focus GX-850W Gold',
      description: 'Power Supply 850W 80+ Gold เงียบ ทนทาน 10ปี Warranty',
      price: 5200,
      stock: 14,
      category: 'อุปกรณ์เสริม'
    },
    {
      name: 'NZXT Kraken 360 RGB AIO',
      description: 'ระบบระบายความร้อนน้ำ 360mm สำหรับ CPU',
      price: 6900,
      stock: 7,
      category: 'อุปกรณ์เสริม'
    },
    {
      name: 'Razer DeathAdder V3 HyperSpeed',
      description: 'เมาส์ gaming ไร้สาย น้ำหนักเบา เซ็นเซอร์ 30000 DPI',
      price: 2890,
      stock: 22,
      category: 'เมาส์'
    }
  ]

  for (const p of products) {
    const exist = await Product.findOne({ name: p.name })
    if (!exist) {
      await Product.create(p)
      console.log('Created product:', p.name)
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
