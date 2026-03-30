#!/bin/bash
# สร้างโฟลเดอร์ MongoDB data
mkdir -p /tmp/mongodb/data
mkdir -p /tmp/mongodb/logs

# Start MongoDB ถ้ายังไม่รัน
if ! pgrep -x mongod > /dev/null; then
  echo "Starting MongoDB..."
  mongod --dbpath /tmp/mongodb/data --logpath /tmp/mongodb/logs/mongod.log --fork --bind_ip 127.0.0.1
  sleep 2
  echo "MongoDB started"
fi

# Seed ข้อมูลเริ่มต้น (ครั้งแรก)
if [ ! -f /tmp/mongodb/.seeded ]; then
  echo "Seeding initial data..."
  node /home/runner/workspace/artifacts/pos-system/server/seed.js
  touch /tmp/mongodb/.seeded
fi

# Start Express server
echo "Starting Express server on port $PORT..."
node /home/runner/workspace/artifacts/pos-system/server/app.js
