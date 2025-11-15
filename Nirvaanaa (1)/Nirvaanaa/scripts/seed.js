import { connect, disconnect } from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


// Import models
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order  from '../models/Order.js';
import Announcement from '../models/Announcement.js';
import Post from '../models/Post.js';

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'libramank@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '7763853089',
    addresses: [{
      type: 'shipping',
      street: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      isDefault: true,
    }],
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    phone: '7763853089',
    addresses: [{
      type: 'shipping',
      street: '456 Customer Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      isDefault: true,
    }],
  },
];

const sampleProducts = [
  {
    title: 'Embroidered Tote Bag',
    slug: 'embroidered-tote-bag',
    description: 'A beautiful handcrafted tote bag featuring intricate embroidery work. Perfect for daily use or special occasions. Made with premium cotton fabric and detailed with traditional Indian embroidery patterns.',
    shortDescription: 'Handcrafted tote bag with traditional embroidery',
    price: 1299,
    comparePrice: 1599,
    stock: 25,
    sku: 'ETB001',
    category: 'bags',
    subcategory: 'tote',
    tags: ['handmade', 'embroidery', 'cotton', 'traditional'],
    materials: ['Cotton', 'Embroidered thread'],
    dimensions: {
      length: 35,
      width: 40,
      height: 15,
      unit: 'cm',
    },
    weight: {
      value: 450,
      unit: 'g',
    },
    colors: [
      { name: 'Cream', hex: '#f5f1eb' },
      { name: 'Beige', hex: '#e0d5c7' },
    ],
    published: true,
    featured: true,
    seo: {
      metaTitle: 'Embroidered Tote Bag - Handcrafted Elegance',
      metaDescription: 'Discover our beautiful handcrafted embroidered tote bag. Perfect blend of tradition and style.',
      keywords: ['embroidered bag', 'handmade tote', 'traditional embroidery'],
    },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/nirvaanaa/tote-bag-1',
        alt: 'Embroidered Tote Bag Front View',
        publicId: 'nirvaanaa/tote-bag-1',
      },
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/nirvaanaa/tote-bag-2',
        alt: 'Embroidered Tote Bag Back View',
        publicId: 'nirvaanaa/tote-bag-2',
      },
    ],
  },
  {
    title: 'Zari Work Clutch',
    slug: 'zari-work-clutch',
    description: 'An elegant clutch bag adorned with traditional zari work. The intricate gold and silver thread embroidery creates a stunning effect perfect for evening events and special occasions.',
    shortDescription: 'Elegant clutch with traditional zari embroidery',
    price: 899,
    comparePrice: 1199,
    stock: 15,
    sku: 'ZWC001',
    category: 'bags',
    subcategory: 'clutch',
    tags: ['zari', 'clutch', 'evening', 'elegant'],
    materials: ['Silk', 'Zari thread', 'Beads'],
    dimensions: {
      length: 25,
      width: 8,
      height: 15,
      unit: 'cm',
    },
    weight: {
      value: 200,
      unit: 'g',
    },
    colors: [
      { name: 'Gold', hex: '#d4af37' },
      { name: 'Silver', hex: '#c0c0c0' },
    ],
    published: true,
    featured: true,
    seo: {
      metaTitle: 'Zari Work Clutch - Traditional Elegance',
      metaDescription: 'Elegant clutch bag with traditional zari embroidery work. Perfect for special occasions.',
      keywords: ['zari clutch', 'embroidery clutch', 'evening bag'],
    },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/nirvaanaa/clutch-1',
        alt: 'Zari Work Clutch Front View',
        publicId: 'nirvaanaa/clutch-1',
      },
    ],
  },
  {
    title: 'Embroidered Wallet',
    slug: 'embroidered-wallet',
    description: 'A practical yet beautiful wallet featuring hand-embroidered designs. Multiple card slots and compartments with traditional Indian embroidery patterns.',
    shortDescription: 'Handcrafted wallet with embroidery details',
    price: 599,
    stock: 30,
    sku: 'EW001',
    category: 'sarees',
    subcategory: 'wallet',
    tags: ['wallet', 'embroidery', 'practical', 'traditional'],
    materials: ['Leather', 'Embroidered thread'],
    dimensions: {
      length: 12,
      width: 2,
      height: 9,
      unit: 'cm',
    },
    weight: {
      value: 80,
      unit: 'g',
    },
    colors: [
      { name: 'Brown', hex: '#8b4513' },
      { name: 'Black', hex: '#000000' },
    ],
    published: true,
    featured: false,
    seo: {
      metaTitle: 'Embroidered Wallet - Handcrafted Accessory',
      metaDescription: 'Beautiful handcrafted wallet with traditional embroidery. Practical and elegant.',
      keywords: ['embroidered wallet', 'handmade wallet', 'traditional accessory'],
    },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/nirvaanaa/wallet-1',
        alt: 'Embroidered Wallet',
        publicId: 'nirvaanaa/wallet-1',
      },
    ],
  },
  {
    title: 'Mirror Work Pouch',
    slug: 'mirror-work-pouch',
    description: 'A stunning pouch featuring traditional mirror work embroidery. The reflective mirrors create a beautiful play of light, making it perfect for storing jewelry or cosmetics.',
    shortDescription: 'Beautiful pouch with mirror work embroidery',
    price: 449,
    stock: 20,
    sku: 'MWP001',
    category: 'sarees',
    subcategory: 'pouch',
    tags: ['mirror work', 'pouch', 'jewelry', 'cosmetics'],
    materials: ['Cotton', 'Mirrors', 'Embroidered thread'],
    dimensions: {
      length: 15,
      width: 3,
      height: 12,
      unit: 'cm',
    },
    weight: {
      value: 120,
      unit: 'g',
    },
    colors: [
      { name: 'Multicolor', hex: '#ff6b6b' },
    ],
    published: true,
    featured: false,
    seo: {
      metaTitle: 'Mirror Work Pouch - Traditional Craft',
      metaDescription: 'Stunning pouch with traditional mirror work embroidery. Perfect for jewelry storage.',
      keywords: ['mirror work pouch', 'embroidery pouch', 'jewelry storage'],
    },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/nirvaanaa/pouch-1',
        alt: 'Mirror Work Pouch',
        publicId: 'nirvaanaa/pouch-1',
      },
    ],
  },
  {
    title: 'Kantha Stitch Shoulder Bag',
    slug: 'kantha-stitch-shoulder-bag',
    description: 'A unique shoulder bag featuring traditional kantha stitch work. This ancient embroidery technique creates beautiful geometric patterns using running stitches.',
    shortDescription: 'Shoulder bag with traditional kantha embroidery',
    price: 999,
    comparePrice: 1299,
    stock: 18,
    sku: 'KSSB001',
    category: 'bags',
    subcategory: 'shoulder',
    tags: ['kantha', 'shoulder bag', 'traditional', 'geometric'],
    materials: ['Cotton', 'Kantha thread'],
    dimensions: {
      length: 30,
      width: 12,
      height: 25,
      unit: 'cm',
    },
    weight: {
      value: 350,
      unit: 'g',
    },
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Off-white', hex: '#fafafa' },
    ],
    published: true,
    featured: true,
    seo: {
      metaTitle: 'Kantha Stitch Shoulder Bag - Traditional Art',
      metaDescription: 'Unique shoulder bag featuring traditional kantha stitch embroidery. Beautiful geometric patterns.',
      keywords: ['kantha bag', 'shoulder bag', 'traditional embroidery'],
    },
    images: [
      {
        url: 'https://res.cloudinary.com/demo/image/upload/v1/nirvaanaa/kantha-bag-1',
        alt: 'Kantha Stitch Shoulder Bag',
        publicId: 'nirvaanaa/kantha-bag-1',
      },
    ],
  },
];

const sampleAnnouncements = [
  {
    text: '🎉 Free shipping on orders above ₹2000! Limited time offer.',
    isActive: true,
    backgroundColor: '#f59e0b',
    textColor: '#ffffff',
    priority: 1,
  },
  {
    text: '✨ New collection launching soon! Stay tuned for exclusive preview.',
    isActive: true,
    backgroundColor: '#8b4513',
    textColor: '#ffffff',
    priority: 2,
  },
];

const samplePosts = [
  {
    title: 'The Art of Traditional Embroidery',
    excerpt: 'Discover the rich history and techniques behind our handcrafted embroidery work.',
    content: 'Traditional Indian embroidery is more than just decorative needlework. It\'s a centuries-old art form that tells stories, preserves culture, and creates beauty through skilled craftsmanship. Our artisans use techniques passed down through generations to create unique pieces that blend tradition with contemporary style.',
    tags: ['embroidery', 'traditional', 'artisan', 'culture'],
    isPublished: true,
    featured: true,
  },
  {
    title: 'Sustainable Fashion: Why Handmade Matters',
    excerpt: 'Learn about the environmental and social benefits of choosing handmade products.',
    content: 'In a world of fast fashion, choosing handmade products is a conscious decision that benefits both the environment and local communities. Our handcrafted pieces are made with sustainable materials, support local artisans, and create lasting value through quality craftsmanship.',
    tags: ['sustainable', 'handmade', 'environment', 'artisans'],
    isPublished: true,
    featured: false,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Announcement.deleteMany({}),
    Post.deleteMany({}),
  ]);
  


    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User({
        ...userData,
        password: userData.password, // Will be hashed by the model
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create products
    const createdProducts = [];
    for (const productData of sampleProducts) {
      const product = new Product({
        ...productData,
        createdBy: createdUsers[0]._id, // Admin user
      });
      await product.save();
      createdProducts.push(product);
      console.log(`Created product: ${product.title}`);
    }

    // Create announcements
    for (const announcementData of sampleAnnouncements) {
      const announcement = new Announcement({
        ...announcementData,
        createdBy: createdUsers[0]._id, // Admin user
      });
      await announcement.save();
      console.log(`Created announcement: ${announcement.text}`);
    }

    // Create posts
    for (const postData of samplePosts) {
      const post = new Post({
        ...postData,
        productRef: createdProducts[0]._id, // Link to first product
        createdBy: createdUsers[0]._id, // Admin user
      });
      await post.save();
      console.log(`Created post: ${post.title}`);
    }

    // Create sample orders
    const sampleOrder = new Order({
      orderNumber: `ORD-${Date.now()}`,
      userId: createdUsers[1]._id, // Regular user
      items: [
        {
          productId: createdProducts[0]._id,
          name: createdProducts[0].title,
          image: createdProducts[0].images[0].url,
          price: createdProducts[0].price,
          quantity: 2,
          sku: createdProducts[0].sku,
        },
        {
          productId: createdProducts[1]._id,
          name: createdProducts[1].title,
          image: createdProducts[1].images[0].url,
          price: createdProducts[1].price,
          quantity: 1,
          sku: createdProducts[1].sku,
        },
      ],
      subtotal: (createdProducts[0].price * 2) + createdProducts[1].price,
      tax: Math.round(((createdProducts[0].price * 2) + createdProducts[1].price) * 0.18),
      shipping: 100,
      discount: 0,
      total: (createdProducts[0].price * 2) + createdProducts[1].price + 100 + Math.round(((createdProducts[0].price * 2) + createdProducts[1].price) * 0.18),
      currency: 'INR',
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      status: 'delivered',
      shippingAddress: {
        name: 'John Doe',
        phone: '7763853089',
        street: '456 Customer Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
      },
      billingAddress: {
        name: 'John Doe',
        phone: '7763853089',
        street: '456 Customer Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
      },
      shippingMethod: {
        name: 'Standard Shipping',
        estimatedDays: 5,
        trackingNumber: 'TRK123456789',
      },
      timeline: [
        {
          status: 'pending',
          message: 'Order placed successfully',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
        {
          status: 'processing',
          message: 'Payment received and order is being processed',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        },
        {
          status: 'shipped',
          message: 'Order has been shipped',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        },
        {
          status: 'delivered',
          message: 'Order has been delivered',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      ],
      emailSent: {
        confirmation: true,
        shipped: true,
        delivered: true,
      },
      smsSent: {
        confirmation: true,
        shipped: true,
        delivered: true,
      },
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await sampleOrder.save();
    console.log(`Created sample order: ${sampleOrder.orderNumber}`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Announcements: ${sampleAnnouncements.length}`);
    console.log(`- Posts: ${samplePosts.length}`);
    console.log('- Orders: 1');
    console.log('\n🔑 Admin credentials:');
    console.log('Email: libramank@gmail.com');
    console.log('Password: admin123');
    console.log('\n👤 User credentials:');
    console.log('Email: john@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase();
