# Lunarlyn IT POS Miniproject

มินิโปรเจ็คส่งอาจารย์เป็นระบบขายหน้าร้าน และ ขายออนไลน์ สำหรับรายวิชา ITMI1210 Designing Web APIs with Node.js

## ✨ Feature
- [x] ระบบ Authentication
- [x] อัปโหลดรูปภาพด้วย Multer
- [x] Cart ตะกร้าใส่สินค้า
- [x] การออกใบเสร็จ
- [x] Dashboard รายงานยอดขาย
- [x] การจัดการสินค้า
- [x] การจัดการพนักงาน
- [x] แก้ไขโปรไฟล์

## 🛠 TechStack
- **Node.js** & **Express**
- **MongoDB** (Mongoose)
- **EJS**

## 🚀 วิธีการติดตั้ง

### 1. Download ZIP ที่หน้า Repository ตาม URL ด้านล่าง
https://github.com/Tearityx/ITMI1210_Lunarlyn_POS_Miniproject

คลิกที่ Code และ กด Download ZIP

### 2. ติดตั้ง Library ที่จำเป็น

เปิด Terminal ในโฟลเดอร์ project และพิมพ์คำสั่งตามนี้

```
npm install
```
### 3. Seed ข้อมูลสำหรับทดลองใน project

เปิด Terminal และใช้คำสั่งนี้เพื่อสร้างข้อมูลทดลองสำหรับทดลองใช้งาน

**ต้องเปิดใช้งานและเชื่อมต่อ Connection ใน MongoDB Compass ก่อนถึงจะใช้คำสั่งนี้ได้**

```
node seed.js
```

### 4. Start Server

```
npm start
```
### 5. เข้าใช้งานระบบ

เซิฟเวอร์จะรันอยู่ที่ port 8080 สามารถเข้าใช้งานระบบได้ตามลิงค์นี้

http://localhost:8080/

## วิธีการเข้าใช้งาน

### Copy Username / Password จาก Terminal ที่ได้มาจากตอน Seed ข้อมูลลง Database มาใช้งานได้เลย
 **ถ้าหาไม่เจอให้ใช้ตามนี้**
```
Manager : manager / 1234
Employee : employee1 / 1234
Customer : customer1 / 1234

```
