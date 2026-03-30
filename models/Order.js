const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  price: { type: Number },
  quantity: { type: Number },
  subtotal: { type: Number }
})

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  employeeName: { type: String, default: '' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'เงินสด' },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'cancelled'], default: 'pending' },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

// สร้างเลข order อัตโนมัติ
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = 'LN' + String(count + 1).padStart(5, '0')
  }
  next()
})

module.exports = mongoose.model('Order', orderSchema)
