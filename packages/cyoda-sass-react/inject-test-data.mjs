/**
 * Script to inject test schema data into the application
 * This simulates having saved schemas in localStorage
 */

import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:3009';
const TEST_SCHEMA_PATH = './test-schema.json';

async function injectTestData() {
  console.log('💉 Injecting test data into application...\n');
  
  // Load test schema
  const testSchema = JSON.parse(fs.readFileSync(TEST_SCHEMA_PATH, 'utf8'));
  console.log('📄 Loaded test schema:', testSchema.schemaName);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to application
    console.log('🌐 Navigating to application...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Inject schema data into localStorage
    console.log('\n💾 Injecting data into localStorage...');
    
    // Create a mock schema list
    const mockSchemas = [
      testSchema,
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        schemaName: 'simple_test_schema',
        timestamp: 1697558400000,
        tables: [
          {
            metadataClassId: 'test-001',
            tableName: 'users',
            uniformedPath: 'data.users',
            hidden: false,
            fields: [
              {
                fieldName: 'user_id',
                fieldType: 'bigint',
                fieldCategory: 'DATA',
                hidden: false,
                flatten: false
              },
              {
                fieldName: 'username',
                fieldType: 'varchar',
                fieldCategory: 'DATA',
                hidden: false,
                flatten: false
              },
              {
                fieldName: 'email',
                fieldType: 'varchar',
                fieldCategory: 'DATA',
                hidden: false,
                flatten: false
              }
            ]
          }
        ]
      }
    ];
    
    // Inject into localStorage (simulating API response cache)
    await page.evaluate((schemas) => {
      // Store schemas in a format that React Query might use
      const queryKey = JSON.stringify(['sql-schema', 'list']);
      const queryData = {
        state: {
          data: schemas,
          dataUpdateCount: 1,
          dataUpdatedAt: Date.now(),
          error: null,
          errorUpdateCount: 0,
          errorUpdatedAt: 0,
          fetchFailureCount: 0,
          fetchFailureReason: null,
          fetchMeta: null,
          isInvalidated: false,
          status: 'success',
          fetchStatus: 'idle'
        }
      };
      
      // Try to inject into React Query cache if available
      try {
        localStorage.setItem(`REACT_QUERY_OFFLINE_CACHE`, JSON.stringify({
          clientState: {
            queries: [
              {
                queryKey: ['sql-schema', 'list'],
                queryHash: queryKey,
                ...queryData
              }
            ],
            mutations: []
          }
        }));
        console.log('✓ Injected into React Query cache');
      } catch (e) {
        console.log('⚠ Could not inject into React Query cache:', e.message);
      }
      
      // Also store in a simple format for manual access
      localStorage.setItem('test-schemas', JSON.stringify(schemas));
      console.log('✓ Stored test schemas in localStorage');
      
    }, mockSchemas);
    
    console.log(`✓ Injected ${mockSchemas.length} test schemas`);
    
    // Reload page to see the data
    console.log('\n🔄 Reloading page to apply changes...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Take screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'after-injection.png', fullPage: true });
    console.log('✓ Screenshot saved: after-injection.png');
    
    // Check if data is visible
    console.log('\n🔍 Checking if data is visible...');
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText.includes('test_customer_schema') || bodyText.includes('simple_test_schema')) {
      console.log('✅ SUCCESS! Test schemas are visible in the UI');
    } else {
      console.log('⚠️  Schemas not visible yet (might need API mock update)');
    }
    
    // Display what was injected
    console.log('\n📊 Injected Data Summary:');
    mockSchemas.forEach((schema, idx) => {
      console.log(`\n${idx + 1}. ${schema.schemaName}`);
      console.log(`   ID: ${schema.id}`);
      console.log(`   Tables: ${schema.tables.length}`);
      schema.tables.forEach(table => {
        console.log(`   - ${table.tableName} (${table.fields.length} fields)`);
      });
    });
    
    // Instructions
    console.log('\n📝 Next Steps:');
    console.log('1. The browser window shows the application with injected data');
    console.log('2. You can now test the schema management features');
    console.log('3. Try clicking on a schema to edit it');
    console.log('4. Test the table editor with drag-and-drop');
    console.log('5. Test hiding/showing fields');
    console.log('6. Test the flatten functionality for array fields');
    
    console.log('\n⏸️  Browser will remain open for testing...');
    console.log('   Press Ctrl+C to close when done.\n');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    // Browser will stay open
  }
}

// Run the injection
injectTestData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

