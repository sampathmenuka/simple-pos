import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding US Supermarket catalog...');

  // 1. Ensure Default Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Store Manager',
      username: 'admin',
      passwordHash,
    },
  });

  // 2. Clear old products & categories to replace with US Supermarket catalog
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 3. Define US Supermarket Categories
  const categoryNames = [
    'Produce',
    'Dairy & Eggs',
    'Bakery & Bread',
    'Meat & Seafood',
    'Beverages',
    'Snacks & Pantry',
    'Frozen Foods',
  ];

  const categoryMap = new Map<string, string>();

  for (const name of categoryNames) {
    const cat = await prisma.category.create({
      data: { name },
    });
    categoryMap.set(name, cat.id);
  }

  // 4. Define US Supermarket Products with realistic prices & stock
  const products = [
    // Produce
    { name: 'Organic Bananas (Bunch)', price: 1.79, stock: 150, category: 'Produce', description: 'Fresh organic yellow bananas' },
    { name: 'Honeycrisp Apples (3 lb bag)', price: 4.99, stock: 80, category: 'Produce', description: 'Crisp and sweet fresh apples' },
    { name: 'Hass Avocados (4 pack)', price: 3.99, stock: 65, category: 'Produce', description: 'Ripe and ready to eat avocados' },
    { name: 'Baby Spinach (16 oz container)', price: 3.49, stock: 45, category: 'Produce', description: 'Pre-washed organic tender baby spinach' },
    { name: 'Roma Tomatoes (per lb)', price: 1.49, stock: 120, category: 'Produce', description: 'Fresh vine-ripened red tomatoes' },

    // Dairy & Eggs
    { name: 'Whole Milk (1 Gallon)', price: 3.89, stock: 60, category: 'Dairy & Eggs', description: 'Grade A pasteurized vitamin D milk' },
    { name: 'Grade A Large Eggs (Dozen)', price: 2.99, stock: 90, category: 'Dairy & Eggs', description: 'Farm-fresh large white eggs' },
    { name: 'Greek Yogurt (32 oz Tub)', price: 4.49, stock: 40, category: 'Dairy & Eggs', description: 'Plain non-fat authentic Greek yogurt' },
    { name: 'Sharp Cheddar Cheese Block (8 oz)', price: 3.29, stock: 55, category: 'Dairy & Eggs', description: 'Aged Wisconsin sharp cheddar cheese' },
    { name: 'Sweet Cream Salted Butter (1 lb)', price: 4.29, stock: 50, category: 'Dairy & Eggs', description: 'Four quarters pure cream salted butter' },

    // Bakery & Bread
    { name: 'Artisan Sourdough Loaf', price: 4.99, stock: 35, category: 'Bakery & Bread', description: 'Freshly baked crusty sourdough bread' },
    { name: 'Whole Wheat Sandwich Bread', price: 2.89, stock: 70, category: 'Bakery & Bread', description: '100% whole grain soft sandwich bread' },
    { name: 'Blueberry Muffins (4 Pack)', price: 5.49, stock: 25, category: 'Bakery & Bread', description: 'Bakery muffins with fresh blueberries' },
    { name: 'Chocolate Chip Cookies (Dozen)', price: 4.49, stock: 30, category: 'Bakery & Bread', description: 'Soft baked chewy chocolate chip cookies' },
    { name: 'Plain Bagels (6 Pack)', price: 3.69, stock: 40, category: 'Bakery & Bread', description: 'New York style boiled and baked plain bagels' },

    // Meat & Seafood
    { name: 'Boneless Skinless Chicken Breasts (1 lb)', price: 4.49, stock: 45, category: 'Meat & Seafood', description: 'All-natural fresh chicken breasts' },
    { name: 'Ground Beef 80/20 (1 lb pack)', price: 5.99, stock: 50, category: 'Meat & Seafood', description: 'Fresh ground chuck beef 80% lean' },
    { name: 'Atlantic Salmon Fillet (1 lb)', price: 9.99, stock: 30, category: 'Meat & Seafood', description: 'Fresh wild-caught Atlantic salmon' },
    { name: 'Applewood Smoked Bacon (16 oz)', price: 6.99, stock: 40, category: 'Meat & Seafood', description: 'Naturally hardwood smoked thick cut pork bacon' },
    { name: 'New York Strip Steak (12 oz)', price: 12.99, stock: 20, category: 'Meat & Seafood', description: 'USDA Choice beef tender strip steak' },

    // Beverages
    { name: '100% Pure Orange Juice (52 fl oz)', price: 3.99, stock: 65, category: 'Beverages', description: 'No pulp freshly squeezed orange juice' },
    { name: 'Sparkling Spring Water (12 Pack)', price: 5.99, stock: 50, category: 'Beverages', description: 'Lime flavored zero-calorie sparkling water' },
    { name: 'Coca-Cola Classic (12 Pack Cans)', price: 7.49, stock: 80, category: 'Beverages', description: 'Original crisp classic soda 12-pack' },
    { name: 'Medium Roast Ground Coffee (12 oz)', price: 8.99, stock: 45, category: 'Beverages', description: '100% Arabica breakfast blend ground coffee' },
    { name: 'Unsweetened Oat Milk (64 fl oz)', price: 4.29, stock: 40, category: 'Beverages', description: 'Plant-based dairy-free creamy oat milk' },

    // Snacks & Pantry
    { name: 'Classic Potato Chips (8 oz bag)', price: 3.49, stock: 90, category: 'Snacks & Pantry', description: 'Crispy salted kettle-cooked potato chips' },
    { name: 'Creamy Peanut Butter (16 oz)', price: 2.99, stock: 60, category: 'Snacks & Pantry', description: 'Roasted peanut spread with sea salt' },
    { name: 'Marinara Pasta Sauce (24 oz)', price: 2.49, stock: 75, category: 'Snacks & Pantry', description: 'Slow simmered tomato & herb pasta sauce' },
    { name: 'Jasmine White Rice (5 lb bag)', price: 5.99, stock: 45, category: 'Snacks & Pantry', description: 'Fragrant long-grain premium white jasmine rice' },
    { name: 'Chewy Granola Bars (8 count)', price: 3.29, stock: 55, category: 'Snacks & Pantry', description: 'Rolled oats with dark chocolate chunks' },

    // Frozen Foods
    { name: 'Four Cheese Frozen Pizza (20 oz)', price: 6.99, stock: 40, category: 'Frozen Foods', description: 'Crispy thin crust mozzarella, provolone & parmesan' },
    { name: 'Vanilla Bean Ice Cream (Pint)', price: 4.49, stock: 35, category: 'Frozen Foods', description: 'Rich and creamy Madagascar vanilla bean ice cream' },
    { name: 'Homestyle Frozen Waffles (10 count)', price: 2.99, stock: 50, category: 'Frozen Foods', description: 'Golden crispy toaster waffles' },
    { name: 'Frozen Cut Mixed Vegetables (16 oz)', price: 1.89, stock: 70, category: 'Frozen Foods', description: 'Corn, peas, carrots, and green beans blend' },
  ];

  for (const p of products) {
    const categoryId = categoryMap.get(p.category);
    if (categoryId) {
      await prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          stock: p.stock,
          description: p.description,
          categoryId: categoryId,
        },
      });
    }
  }

  // 5. Seed a couple sample US Customers
  const customers = [
    { name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '(555) 234-5678' },
    { name: 'Michael Chang', email: 'mchang@example.com', phone: '(555) 876-5432' },
    { name: 'Emily Rodriguez', email: 'emily.r@example.com', phone: '(555) 345-6789' },
    { name: 'David Thompson', email: 'dthompson@example.com', phone: '(555) 987-6543' },
  ];

  for (const c of customers) {
    await prisma.customer.create({
      data: c,
    });
  }

  console.log(`Seeded ${categoryNames.length} US supermarket departments, ${products.length} products, and ${customers.length} customers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
