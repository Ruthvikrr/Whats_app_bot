import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./data/triuss_bot.db');

// 1. Remove mock test runner messages
db.exec(`
  DELETE FROM messages 
  WHERE phone_number IN ('1234567890', '9876543210', '919876543210') 
     OR message_id LIKE '%MOCK%' 
     OR message_id LIKE '%duplicate%';
`);

// 2. Remove mock test runner leads
db.exec(`
  DELETE FROM leads 
  WHERE phone_number IN ('1234567890', '9876543210', '919876543210');
`);

// 3. Remove non-product or test items from products catalog
db.exec(`
  DELETE FROM catalog_items 
  WHERE sku IN ('TEST-SKU-101', 'RE-01');
`);

// 4. Update Ruthvik's lead
db.exec(`
  UPDATE leads 
  SET name = 'Ruthvik',
      interested_service = '9H Ceramic Coating Detailing',
      active_demo = 'Auto Detailing'
  WHERE phone_number = '917904321265';
`);

// 5. Add clean jewelry items if not present
const insertItem = db.prepare(`
  INSERT OR IGNORE INTO catalog_items (sku, name, category, price, description, image_url, payment_url, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1);
`);

insertItem.run(
  'JW-03',
  'Classic Solitaire Stud Earrings',
  'jewelry',
  1899,
  'Handcrafted 925 silver stud earrings with sparkling cut stone.',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  'https://rzp.io/l/demo-earrings'
);

insertItem.run(
  'JW-04',
  '18K Gold Plated Kada Bangle',
  'jewelry',
  2499,
  'Premium royal kada with anti-tarnish micro-polish finish.',
  'https://images.unsplash.com/photo-1611591475887-25e6e6576fa1?w=800&q=80',
  'https://rzp.io/l/demo-kada'
);

console.log('--- CLEANUP COMPLETED ---');
console.log('Leads:', db.prepare('SELECT * FROM leads').all());
console.log('Catalog:', db.prepare('SELECT sku, name, price FROM catalog_items').all());
console.log('Message count:', db.prepare('SELECT count(*) as c FROM messages').get());
