# Test Schema Documentation

This document describes the test schema provided for testing the cyoda-sass-react application.

---

## 📄 Overview

**File**: `test-schema.json`  
**Schema Name**: `test_customer_schema`  
**Purpose**: Comprehensive test data covering all application features  
**Tables**: 4 (3 visible, 1 hidden)  
**Total Fields**: 29 fields across all tables  

---

## 🗂️ Schema Structure

### Schema Metadata

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "schemaName": "test_customer_schema",
  "timestamp": 1697558400000
}
```

---

## 📊 Tables

### 1. customers

**Purpose**: Customer master data with nested address information

**Metadata**:
- `metadataClassId`: customer-class-001
- `tableName`: customers
- `uniformedPath`: data.customers
- `hidden`: false

**Fields** (9 total):

| Field Name | Type | Category | Features |
|------------|------|----------|----------|
| customer_id | bigint | DATA | Primary key |
| first_name | varchar | DATA | - |
| last_name | varchar | DATA | - |
| email | varchar | DATA | - |
| phone_number | varchar | DATA | - |
| date_of_birth | date | DATA | Date type |
| created_at | timestamp | METADATA | Audit field |
| updated_at | timestamp | METADATA | Audit field |
| **addresses** | **array** | **DATA** | **Nested, Flatten=true** |

**Nested Fields in addresses** (6 fields):
- street (varchar, DATA)
- city (varchar, DATA)
- state (varchar, DATA)
- zip_code (varchar, DATA)
- country (varchar, DATA)
- address_type (varchar, DATA)

**Test Cases**:
- ✅ Multiple field types
- ✅ Nested array with flatten
- ✅ Metadata vs Data categories
- ✅ Date and timestamp types

---

### 2. orders

**Purpose**: Order transactions with nested order items

**Metadata**:
- `metadataClassId`: order-class-001
- `tableName`: orders
- `uniformedPath`: data.orders
- `hidden`: false

**Fields** (9 total):

| Field Name | Type | Category | Features |
|------------|------|----------|----------|
| order_id | bigint | DATA | Primary key |
| customer_id | bigint | DATA | Foreign key |
| order_date | timestamp | DATA | - |
| total_amount | decimal | DATA | Financial data |
| status | varchar | DATA | - |
| shipping_address | varchar | DATA | - |
| **order_items** | **array** | **DATA** | **Nested, Flatten=true** |
| created_at | timestamp | METADATA | Audit field |
| updated_at | timestamp | METADATA | Audit field |

**Nested Fields in order_items** (5 fields):
- product_id (bigint, DATA)
- product_name (varchar, DATA)
- quantity (int, DATA)
- unit_price (decimal, DATA)
- discount (decimal, DATA)

**Test Cases**:
- ✅ Decimal type for financial data
- ✅ Nested array with flatten
- ✅ Integer type
- ✅ Multiple decimal fields

---

### 3. products

**Purpose**: Product catalog

**Metadata**:
- `metadataClassId`: product-class-001
- `tableName`: products
- `uniformedPath`: data.products
- `hidden`: false

**Fields** (9 total):

| Field Name | Type | Category | Features |
|------------|------|----------|----------|
| product_id | bigint | DATA | Primary key |
| product_name | varchar | DATA | - |
| description | varchar | DATA | - |
| category | varchar | DATA | - |
| price | decimal | DATA | Financial data |
| stock_quantity | int | DATA | Inventory |
| sku | varchar | DATA | Unique identifier |
| is_active | boolean | DATA | Boolean type |
| created_at | timestamp | METADATA | Audit field |

**Test Cases**:
- ✅ Boolean field type
- ✅ Integer for quantities
- ✅ Decimal for pricing
- ✅ No nested fields (simple table)

---

### 4. archived_data (HIDDEN)

**Purpose**: Demonstrates hidden table functionality

**Metadata**:
- `metadataClassId`: hidden-table-001
- `tableName`: archived_data
- `uniformedPath`: data.archived
- `hidden`: **true**

**Fields** (2 total):

| Field Name | Type | Category | Features |
|------------|------|----------|----------|
| archive_id | bigint | DATA | Primary key |
| archived_date | timestamp | METADATA | Archive timestamp |

**Test Cases**:
- ✅ Hidden table feature
- ✅ Hidden tables dialog
- ✅ Show/hide functionality

---

## 🎯 Feature Coverage

### Field Types Tested

- [x] **bigint** - Large integers (IDs)
- [x] **varchar** - Variable strings (names, emails)
- [x] **date** - Date values (date_of_birth)
- [x] **timestamp** - Timestamps (created_at, updated_at)
- [x] **decimal** - Decimal numbers (prices, amounts)
- [x] **int** - Integers (quantities)
- [x] **boolean** - True/false (is_active)
- [x] **array** - Nested structures (addresses, order_items)

### Field Categories Tested

- [x] **DATA** - Business data fields
- [x] **METADATA** - System metadata fields

### Features Tested

- [x] **Nested Arrays** - 2 tables with nested fields
- [x] **Flatten Functionality** - Both nested arrays use flatten
- [x] **Hidden Tables** - 1 hidden table
- [x] **Hidden Fields** - Can be tested by hiding any field
- [x] **Multiple Tables** - 4 tables in one schema
- [x] **Field Validation** - All field names follow rules
- [x] **Drag and Drop** - Can reorder all fields
- [x] **Field Categories** - Mix of DATA and METADATA

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Schema Operations

1. Load test-schema.json
2. View schema in list
3. Edit schema
4. Save changes
5. Delete schema

### Scenario 2: Table Management

1. View all 4 tables
2. Switch between table tabs
3. View hidden table via dialog
4. Hide/show tables

### Scenario 3: Field Management

1. View fields in each table
2. Edit field names
3. Change field types
4. Change field categories
5. Reorder fields via drag-and-drop

### Scenario 4: Nested Fields

1. View customers table
2. Find addresses array field
3. Verify flatten checkbox is checked
4. View nested fields (street, city, etc.)
5. Edit nested field names
6. Reorder nested fields

### Scenario 5: Hidden Fields

1. Hide a field (click eye icon)
2. Verify field disappears
3. Click "Hidden Fields" button
4. View hidden field in dialog
5. Unhide field
6. Verify field reappears

### Scenario 6: Validation

1. Try to rename field to invalid name (uppercase)
2. Verify validation error
3. Try duplicate field name
4. Verify uniqueness error
5. Use valid name
6. Verify success

---

## 📋 Usage Instructions

### Method 1: Manual Import (if available)

```bash
# Copy the schema
cat test-schema.json

# In the application:
# 1. Click "Create schema" or "Import"
# 2. Paste JSON data
# 3. Save
```

### Method 2: Automated Test

```bash
# Run the schema upload test
node test-schema-upload.mjs

# Browser will open and navigate to schema creation
# Follow on-screen instructions
```

### Method 3: Data Injection

```bash
# Inject test data into application
node inject-test-data.mjs

# Application will reload with test schemas
# Browse and edit schemas
```

---

## 🔍 Verification Checklist

After loading the test schema, verify:

- [ ] Schema name displays: "test_customer_schema"
- [ ] 4 tables visible (or 3 if hidden table is hidden)
- [ ] customers table has 9 fields
- [ ] addresses array field has 6 nested fields
- [ ] orders table has 9 fields
- [ ] order_items array field has 5 nested fields
- [ ] products table has 9 fields
- [ ] archived_data table is hidden
- [ ] All field types display correctly
- [ ] Flatten checkboxes are checked for array fields
- [ ] Metadata fields are marked correctly
- [ ] Drag handles appear on all fields
- [ ] Eye icons appear on all fields

---

## 📊 Statistics

### Overall

- **Total Tables**: 4
- **Visible Tables**: 3
- **Hidden Tables**: 1
- **Total Fields**: 29
- **Nested Fields**: 11 (6 in addresses + 5 in order_items)
- **Top-level Fields**: 18
- **DATA Fields**: 24
- **METADATA Fields**: 5
- **Array Fields**: 2
- **Flatten Enabled**: 2

### By Table

| Table | Fields | Nested | Hidden |
|-------|--------|--------|--------|
| customers | 9 | 6 | No |
| orders | 9 | 5 | No |
| products | 9 | 0 | No |
| archived_data | 2 | 0 | Yes |

---

## 🎓 Learning Objectives

This test schema helps verify:

1. **Data Modeling** - Complex nested structures
2. **Field Types** - All supported types
3. **Validation** - Field name rules
4. **UI Interactions** - Drag-and-drop, hide/show
5. **State Management** - Changes persist
6. **Nested Structures** - Recursive components
7. **Metadata** - Audit fields
8. **Hidden Items** - Soft delete functionality

---

## 🚀 Next Steps

After testing with this schema:

1. Create your own custom schemas
2. Test with real data from your domain
3. Verify all edge cases
4. Test performance with large schemas
5. Test with many tables (10+)
6. Test with deeply nested structures (3+ levels)

---

## 📝 Notes

- All field names follow the validation rules (lowercase, underscores, numbers)
- Nested fields demonstrate the recursive component structure
- Hidden table demonstrates soft delete functionality
- Mix of DATA and METADATA categories shows categorization
- Multiple field types ensure type handling works correctly

---

**Ready to test! 🧪**

