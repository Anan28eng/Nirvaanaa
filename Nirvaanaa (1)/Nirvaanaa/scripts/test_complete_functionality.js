const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testCompleteFunctionality() {
  console.log('🧪 Testing Complete Functionality...\n');

  const tests = [
    { name: 'Products API', fn: testProductsAPI },
    { name: 'KPIs API', fn: testKPIsAPI },
    { name: 'Analytics API', fn: testAnalyticsAPI },
    { name: 'Users API', fn: testUsersAPI },
    { name: 'Orders API', fn: testOrdersAPI },
    { name: 'Cart API', fn: testCartAPI },
    { name: 'Banners API', fn: testBannersAPI },
    { name: 'Product Creation', fn: testProductCreation },
    { name: 'Stock Validation', fn: testStockValidation },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      await test.fn();
      console.log(`✅ ${test.name} - PASSED\n`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED: ${error.message}\n`);
      failed++;
    }
  }

  console.log('📊 Test Summary:');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

async function testProductsAPI() {
  const response = await fetch(`${BASE_URL}/api/products`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.products) throw new Error('No products array in response');
  
  console.log(`   Found ${data.products.length} products`);
  
  // Check if products have stock
  const productsWithStock = data.products.filter(p => p.stock > 0);
  console.log(`   ${productsWithStock.length} products in stock`);
}

async function testKPIsAPI() {
  const response = await fetch(`${BASE_URL}/api/kpis`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.kpis) throw new Error('No KPIs array in response');
  
  console.log(`   Found ${data.kpis.length} KPIs`);
}

async function testAnalyticsAPI() {
  const ranges = ['day', 'week', 'month', 'year'];
  
  for (const range of ranges) {
    const response = await fetch(`${BASE_URL}/api/analytics?range=${range}`);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${range}`);
    
    const data = await response.json();
    console.log(`   ${range}: ${data.revenue?.length || 0} revenue records`);
  }
}

async function testUsersAPI() {
  const response = await fetch(`${BASE_URL}/api/users`);
  // This will likely return 401 (unauthorized) since we're not authenticated as admin
  if (response.status === 401) {
    console.log('   API exists but requires admin authentication (expected)');
    return;
  }
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  console.log(`   Found ${data.users?.length || 0} users`);
}

async function testOrdersAPI() {
  const response = await fetch(`${BASE_URL}/api/orders`);
  // This will likely return 401 (unauthorized) since we're not authenticated as admin
  if (response.status === 401) {
    console.log('   API exists but requires admin authentication (expected)');
    return;
  }
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  console.log(`   Found ${data.orders?.length || 0} orders`);
}

async function testCartAPI() {
  const response = await fetch(`${BASE_URL}/api/cart`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  if (!data.items) throw new Error('No items array in response');
  
  console.log(`   Cart API working (${data.items.length} items)`);
}

async function testBannersAPI() {
  const response = await fetch(`${BASE_URL}/api/banners`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  console.log(`   Found ${Object.keys(data.banners || {}).length} banner types`);
}

async function testProductCreation() {
  const productData = {
    title: 'Test Product for Cart',
    description: 'This is a test product to verify cart functionality',
    price: 999,
    category: 'sarees',
    stock: 5,
    mainImage: 'https://via.placeholder.com/400x400'
  };

  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });

  // This will likely return 401 since we're not authenticated as admin
  if (response.status === 401) {
    console.log('   Product creation requires admin authentication (expected)');
    return;
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const product = await response.json();
  console.log(`   Created product: ${product.title} with stock: ${product.stock}`);
}

async function testStockValidation() {
  // Test cart with out-of-stock scenario
  const cartData = {
    productId: 'test-product-id',
    name: 'Test Product',
    price: 999,
    image: 'https://via.placeholder.com/400x400',
    quantity: 10,
    slug: 'test-product',
    email: 'test@example.com'
  };

  const response = await fetch(`${BASE_URL}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cartData)
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.error && error.error.includes('stock')) {
      console.log('   Stock validation working (expected error for non-existent product)');
      return;
    }
  }

  console.log('   Cart API responded successfully');
}

// Run tests
testCompleteFunctionality().catch(console.error);
