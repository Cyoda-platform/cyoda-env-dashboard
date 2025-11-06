#!/usr/bin/env node

/**
 * Simple test script to verify the Processing Manager app is working
 * Uses native fetch to test the application
 */

const BASE_URL = 'http://localhost:3008';

async function testEndpoint(url, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const status = response.status;
    const statusText = response.statusText;
    
    if (status === 200) {
      const html = await response.text();
      
      // Check if it's HTML
      if (html.includes('<!DOCTYPE html') || html.includes('<html')) {
        console.log(`   ✅ PASS - Status: ${status} ${statusText}`);
        console.log(`   📄 HTML page loaded successfully`);
        return { success: true, url, description };
      } else {
        console.log(`   ⚠️  WARN - Status: ${status} but not HTML`);
        return { success: false, url, description, error: 'Not HTML' };
      }
    } else {
      console.log(`   ❌ FAIL - Status: ${status} ${statusText}`);
      return { success: false, url, description, error: `Status ${status}` };
    }
  } catch (error) {
    console.log(`   ❌ FAIL - Error: ${error.message}`);
    return { success: false, url, description, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Processing Manager Application Tests');
  console.log('=' .repeat(60));
  
  const tests = [
    {
      url: `${BASE_URL}/processing-ui`,
      description: 'Home page loads'
    },
    {
      url: `${BASE_URL}/processing-ui/nodes`,
      description: 'Nodes page loads'
    },
    {
      url: `${BASE_URL}/processing-ui/nodes/demo-node`,
      description: 'Node detail page loads'
    },
    {
      url: `${BASE_URL}/`,
      description: 'Root redirects properly'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.description}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (passed === total) {
    console.log('🎉 All tests passed! The application is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

