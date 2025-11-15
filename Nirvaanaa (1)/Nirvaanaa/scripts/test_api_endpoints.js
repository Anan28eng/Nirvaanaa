import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  const endpoints = [
    { name: 'Products API', url: '/api/products', method: 'GET' },
    { name: 'Users API', url: '/api/users', method: 'GET' },
    { name: 'Orders API', url: '/api/orders', method: 'GET' },
    { name: 'KPIs API', url: '/api/kpis', method: 'GET' },
    { name: 'Analytics API', url: '/api/analytics', method: 'GET' },
    { name: 'Cart API', url: '/api/cart', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await fetch(`${BASE_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log(`✅ ${endpoint.name} - Status: ${response.status}`);
      } else {
        console.log(`❌ ${endpoint.name} - Status: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} - Error: ${error.message}`);
    }
  }

  console.log('\n🎉 API endpoint testing completed!');
}

// Test product creation (requires admin session)
async function testProductCreation() {
  console.log('\n🧪 Testing Product Creation...');
  
  const productData = {
    title: 'Test Product',
    description: 'This is a test product created via API',
    price: 999,
    category: 'sarees',
    stock: 10,
    mainImage: 'https://via.placeholder.com/400x400',
  };

  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      const product = await response.json();
      console.log(`✅ Product created successfully: ${product.title}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Stock: ${product.stock}`);
    } else {
      const error = await response.json();
      console.log(`❌ Product creation failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`❌ Product creation error: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  await testAPIEndpoints();
  await testProductCreation();
}

runTests().catch(console.error);
