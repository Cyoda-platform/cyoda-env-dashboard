# Test Data for Tableau Reports

This directory contains sample test data that can be used to test report creation and execution in the Tableau application.

## Available Test Data

### 1. **sample-transactions.json**
Contains 5 sample transaction entities with the following fields:
- `transactionId` - Unique transaction identifier
- `amount` - Transaction amount (decimal)
- `currency` - Currency code (USD, EUR, GBP)
- `status` - Transaction status (COMPLETED, PENDING, FAILED)
- `description` - Transaction description
- `customerId` - Reference to customer
- `transactionDate` - ISO 8601 timestamp

**Entity Class:** `com.cyoda.tms.model.entities.Transaction`

### 2. **sample-customers.json**
Contains 5 sample customer entities with the following fields:
- `customerId` - Unique customer identifier
- `firstName` - Customer first name
- `lastName` - Customer last name
- `email` - Email address
- `phone` - Phone number
- `country` - Country name
- `status` - Customer status (ACTIVE, INACTIVE)

**Entity Class:** `com.cyoda.tms.model.entities.Customer`

---

## How to Import Test Data

### Option 1: Using the Platform API (if backend is running)

If you have a Cyoda backend running, you can import entities using the API:

```bash
# Import transactions
curl -X POST http://localhost:8080/platform-api/entity/com.cyoda.tms.model.entities.Transaction/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-transactions.json" \
  -F "format=json"

# Import customers
curl -X POST http://localhost:8080/platform-api/entity/com.cyoda.tms.model.entities.Customer/import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-customers.json" \
  -F "format=json"
```

### Option 2: Using the React Application

The application includes an `importEntities` API function that can be used:

```typescript
import { importEntities } from '@cyoda/http-api-react';

// Create a File object from your JSON data
const file = new File([JSON.stringify(testData)], 'test-data.json', {
  type: 'application/json'
});

// Import the entities
await importEntities('com.cyoda.tms.model.entities.Transaction', file, 'json');
```

### Option 3: Manual Entity Creation

You can also create entities one by one using the `createEntity` API:

```typescript
import { createEntity } from '@cyoda/http-api-react';

await createEntity({
  entityClass: 'com.cyoda.tms.model.entities.Transaction',
  entityId: 'TXN-001',
  transition: 'CREATE',
  transactional: false,
  async: false,
  values: [
    { columnPath: 'transactionId', value: 'TXN-001' },
    { columnPath: 'amount', value: 1500.50 },
    { columnPath: 'currency', value: 'USD' },
    // ... more fields
  ]
});
```

---

## Using Test Data for Report Creation

Once the test data is imported, you can create reports using these entities:

### Example: Transaction Report

1. Navigate to **Reports** → **Report Config** tab
2. Click **Create New**
3. Fill in the form:
   - **Name:** "Transaction Report"
   - **Description:** "Report showing all transactions"
   - **Entity:** Select `com.cyoda.tms.model.entities.Transaction`
4. Configure columns in the **Columns** tab:
   - Add columns: `transactionId`, `amount`, `currency`, `status`, `description`, `transactionDate`
5. (Optional) Add filters in the **Filter** tab:
   - Filter by status: `status = COMPLETED`
   - Filter by amount: `amount > 1000`
6. Click **Update** to save
7. Click **Update and Run** to execute the report

### Example: Customer Report

1. Navigate to **Reports** → **Report Config** tab
2. Click **Create New**
3. Fill in the form:
   - **Name:** "Active Customers"
   - **Description:** "Report showing all active customers"
   - **Entity:** Select `com.cyoda.tms.model.entities.Customer`
4. Configure columns:
   - Add columns: `customerId`, `firstName`, `lastName`, `email`, `country`, `status`
5. Add filter:
   - Filter by status: `status = ACTIVE`
6. Click **Update and Run**

---

## Mock Data (No Backend Required)

If you don't have a backend running, the application will use mock entity types defined in `useEntityTypes.ts`:

```typescript
const MOCK_ENTITY_TYPES = [
  'com.cyoda.tms.model.entities.Account',
  'com.cyoda.tms.model.entities.Transaction',
  'com.cyoda.tms.model.entities.Customer',
  'com.cyoda.tms.model.entities.Product',
  'com.cyoda.tms.model.entities.Order',
  'com.cyoda.tms.model.entities.Payment',
  'com.cyoda.tms.model.entities.Invoice',
  'com.cyoda.tms.model.entities.User',
];
```

You can select any of these entity types when creating reports, even without actual data. The UI will work, but running reports will require actual backend data.

---

## Notes

- **Entity IDs must be unique** within each entity class
- **Column paths** should match the actual entity schema in your backend
- **Date formats** should be ISO 8601 (e.g., `2024-01-15T10:30:00Z`)
- **Decimal values** should be numbers, not strings
- The test data uses common entity types from the Cyoda TMS (Transaction Management System) model

---

## Troubleshooting

### "Entity class not found"
- Make sure the backend is running and the entity class is registered
- Check that the entity class name matches exactly (case-sensitive)

### "Import failed"
- Verify the JSON format is correct
- Check that all required fields are provided
- Ensure the backend API is accessible

### "No entities showing in reports"
- Verify entities were imported successfully
- Check the entity class name in the report configuration
- Try running a simple report without filters first

---

## Next Steps

After importing test data:

1. ✅ Create a simple report to verify data is accessible
2. ✅ Test different column configurations
3. ✅ Test filtering and sorting
4. ✅ Test grouping and summary functions
5. ✅ Test report execution and history
6. ✅ Test stream reports with range conditions

Happy testing! 🚀

