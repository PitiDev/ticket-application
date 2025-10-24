# Gold Sum Service API Testing Guide

Complete list of API endpoints for testing goldSumService.js

**Base URL:** `http://localhost:4000`

**Note:** These endpoints are PUBLIC (authentication is commented out in routes)

---

## Table of Contents
1. [Gold Purchase Report](#1-gold-purchase-report)
2. [Gold Selling Report](#2-gold-selling-report)
3. [P2P Transfer Report](#3-p2p-transfer-report)
4. [Gold Purchases List](#4-gold-purchases-list)
5. [Current Gold Price](#5-current-gold-price)
6. [All Gold Prices](#6-all-gold-prices)

---

## 1. Gold Purchase Report
Get comprehensive report with profit/loss analysis and selling recommendations.

**Endpoint:** `GET /api/gold/report/:customerId`

**Tables Used:**
- `BUY_GOLD_TXN` (with CORE_BANKING_SEQNO)
- `EXCHANGE_RATE`

**Columns Retrieved:**
```sql
TRANSACTION_ID, CORE_BANKING_REF, CORE_BANKING_SEQNO, DR_ACCOUNT_NO,
GOLD_WEIGHT, PRICE_PER_GRAM, TOTAL_AMOUNT, CURRENCY_CODE,
CR_CBK_SEQNO, CREATED_AT
```

### Test Examples:

```bash
# Using cURL
curl -X GET "http://localhost:4000/api/gold/report/2508-0000002-5"

# With Postman
GET http://localhost:4000/api/gold/report/2508-0000002-5

# Using browser
http://localhost:4000/api/gold/report/2508-0000002-5
```

### Response Format:
```json
{
  "success": true,
  "requestId": "gold-1234567890",
  "data": {
    "summary": {
      "customer_id": "2508-0000002-5",
      "total_transactions": 5,
      "total_gold_weight": "50.50 grams",
      "total_investment": "LAK 10,500,000.00",
      "total_current_value": "LAK 11,250,000.00",
      "total_profit_loss": "LAK 750,000.00",
      "total_profit_loss_percentage": "7.14%",
      "is_overall_profitable": true,
      "profitable_transactions": 3,
      "current_gold_price": {
        "date": "Jan 15, 2025, 08:30 AM",
        "buy_rate": "LAK 220,000.00",
        "sell_rate": "LAK 225,000.00"
      }
    },
    "transactions": [
      {
        "transaction_id": "TXN001",
        "core_banking_ref": "CBR001",
        "core_banking_seqno": "SEQ001",
        "account_no": "1200238910003435",
        "purchase_date": "Jan 10, 2025, 10:00 AM",
        "gold_weight": "10.00 grams",
        "purchase_price_per_gram": "LAK 200,000.00",
        "current_price_per_gram": "LAK 220,000.00",
        "total_purchase_amount": "LAK 2,000,000.00",
        "current_value": "LAK 2,200,000.00",
        "profit_loss": "LAK 200,000.00",
        "profit_loss_percentage": "10.00%",
        "is_profitable": true
      }
    ],
    "recommendations": [
      {
        "type": "HIGH_PROFIT",
        "message": "Consider selling these high-profit gold purchases",
        "details": "2 purchases with more than 5% profit",
        "transactions": []
      },
      {
        "type": "MARKET_TREND",
        "overall_profit": "LAK 750,000.00",
        "overall_profit_percentage": "7.14%",
        "message": "Overall market trend is positive. Consider selling some profitable gold to realize gains.",
        "profitable_transactions": 3,
        "non_profitable_transactions": 2,
        "total_gold_weight": "50.50 grams",
        "profitable_gold_weight": "30.00 grams"
      }
    ]
  },
  "message": "Gold report generated successfully"
}
```

---

## 2. Gold Selling Report
Get summary of all gold selling transactions.

**Endpoint:** `GET /api/gold/selling-report/:customerId`

**Tables Used:**
- `SELL_GOLD_TRANSACTION` (with CORE_BANKING_SEQNO)

**Columns Retrieved:**
```sql
TRANSACTION_ID, CORE_BANKING_SEQNO, DR_ACCOUNT_NO, GOLD_WEIGHT,
PRICE_PER_GRAM, TOTAL_AMOUNT, CURRENCY_CODE, CREATED_AT
```

### Test Examples:

```bash
# Using cURL
curl -X GET "http://localhost:4000/api/gold/selling-report/2508-0000002-5"

# With Postman
GET http://localhost:4000/api/gold/selling-report/2508-0000002-5
```

### Response Format:
```json
{
  "success": true,
  "requestId": "gold-selling-1234567890",
  "data": {
    "summary": {
      "customer_id": "2508-0000002-5",
      "total_transactions": 3,
      "total_gold_weight": "25.00 grams",
      "total_sold_amount": "LAK 5,625,000.00",
      "average_price_per_gram": "LAK 225,000.00"
    },
    "transactions": [
      {
        "transaction_id": "SELL001",
        "core_banking_seqno": "SEQ001",
        "account_no": "1200238910003435",
        "sale_date": "Jan 12, 2025, 02:30 PM",
        "gold_weight": "10.00 grams",
        "price_per_gram": "LAK 225,000.00",
        "total_amount": "LAK 2,250,000.00",
        "currency": "LAK"
      }
    ]
  },
  "message": "Gold selling report generated successfully"
}
```

---

## 3. P2P Transfer Report
Get summary of peer-to-peer gold transfers.

**Endpoint:** `GET /api/gold/p2p-report/:customerId`

**Tables Used:**
- `P2P_TRANSACTION`

**Columns Retrieved:**
```sql
TRANSACTION_ID, CORE_BANKING_SEQNO, DR_ACCOUNT_NO, DR_CURRENCY_CODE,
CR_ACCOUNT_NO, CR_CURRENCY_CODE, GOLD_WEIGHT, CREATED_AT
```

### Test Examples:

```bash
# Using cURL
curl -X GET "http://localhost:4000/api/gold/p2p-report/2508-0000002-5"

# With Postman
GET http://localhost:4000/api/gold/p2p-report/2508-0000002-5
```

### Response Format:
```json
{
  "success": true,
  "requestId": "gold-p2p-1234567890",
  "data": {
    "summary": {
      "customer_id": "2508-0000002-5",
      "total_transactions": 4,
      "total_gold_weight": "15.50 grams",
      "transfers_sent": 2,
      "transfers_received": 2
    },
    "transactions": [
      {
        "transaction_id": "P2P001",
        "core_banking_ref": "SEQ001",
        "debit_account": "1200238910003435",
        "debit_currency": "LBI",
        "credit_account": "1200238910003436",
        "credit_currency": "LBI",
        "gold_weight": "5.50 grams",
        "transfer_date": "Jan 14, 2025, 09:15 AM",
        "transfer_type": "Sent",
        "direction": "Outgoing"
      }
    ]
  },
  "message": "P2P gold transfer report generated successfully"
}
```

---

## 4. Gold Purchases List
Get raw list of gold purchase transactions (without profit/loss calculations).

**Endpoint:** `GET /api/gold/purchases/:customerId`

**Tables Used:**
- `BUY_GOLD_TXN` (with CORE_BANKING_SEQNO)

**Columns Retrieved:**
```sql
TRANSACTION_ID, CORE_BANKING_REF, CORE_BANKING_SEQNO, DR_ACCOUNT_NO,
GOLD_WEIGHT, PRICE_PER_GRAM, TOTAL_AMOUNT, CURRENCY_CODE,
CR_CBK_SEQNO, CREATED_AT
```

### Test Examples:

```bash
# Using cURL
curl -X GET "http://localhost:4000/api/gold/purchases/2508-0000002-5"

# With Postman
GET http://localhost:4000/api/gold/purchases/2508-0000002-5
```

### Response Format:
```json
{
  "success": true,
  "requestId": "gold-purchases-1234567890",
  "data": {
    "customer_id": "2508-0000002-5",
    "total_purchases": 5,
    "purchases": [
      {
        "transaction_id": "TXN001",
        "core_banking_ref": "CBR001",
        "core_banking_seqno": "SEQ001",
        "account_no": "1200238910003435",
        "purchase_date": "Jan 10, 2025, 10:00 AM",
        "gold_weight": "10.00 grams",
        "price_per_gram": "LAK 200,000.00",
        "total_amount": "LAK 2,000,000.00",
        "currency": "LAK"
      }
    ]
  },
  "message": "Gold purchases retrieved successfully"
}
```

---

## 5. Current Gold Price
Get the latest gold exchange rate.

**Endpoint:** `GET /api/gold/price`

**Tables Used:**
- `EXCHANGE_RATE`

**Columns Retrieved:**
```sql
CCY, EFFECT_FROM_DATE, BUY_RATE, SELL_RATE, MID_RATE,
CREATED_BY, CREATED_DT$, UPDATED_BY, UPDATED_DT$
```

### Test Examples:

```bash
# Using cURL
curl -X GET "http://localhost:4000/api/gold/price"

# With Postman
GET http://localhost:4000/api/gold/price

# Using browser
http://localhost:4000/api/gold/price
```

### Response Format:
```json
{
  "success": true,
  "requestId": "gold-price-1234567890",
  "data": {
    "date": "Jan 15, 2025, 08:30 AM",
    "currency": "LAK",
    "buy_rate": "LAK 220,000.00",
    "sell_rate": "LAK 225,000.00",
    "mid_rate": "LAK 222,500.00"
  },
  "message": "Current gold price retrieved successfully"
}
```

---

## 6. All Gold Prices
Get complete history of gold prices (for charts).

**Endpoint:** `GET /api/gold/all_price`

**Tables Used:**
- `EXCHANGE_RATE`

**Columns Retrieved:**
```sql
CCY, EFFECT_FROM_DATE, BUY_RATE, SELL_RATE, MID_RATE
```

### Test Examples:

```bash
# Using cURL
curl -X GET "http://localhost:4000/api/gold/all_price"

# With Postman
GET http://localhost:4000/api/gold/all_price

# Using browser
http://localhost:4000/api/gold/all_price
```

### Response Format:
```json
{
  "success": true,
  "requestId": "gold-price-1234567890",
  "data": {
    "total_records": 150,
    "currencies": ["LAK", "USD", "THB"],
    "prices": [
      {
        "date": "Jan 15, 2025, 08:30 AM",
        "timestamp": 1705305000000,
        "currency": "LAK",
        "buy_rate": 220000,
        "sell_rate": 225000,
        "mid_rate": 222500,
        "open": 220000,
        "high": 225000,
        "low": 220000,
        "close": 225000
      }
    ],
    "grouped_by_currency": {
      "LAK": [
        {
          "date": "Jan 15, 2025, 08:30 AM",
          "timestamp": 1705305000000,
          "currency": "LAK",
          "buy_rate": 220000,
          "sell_rate": 225000,
          "mid_rate": 222500,
          "open": 220000,
          "high": 225000,
          "low": 220000,
          "close": 225000
        }
      ]
    }
  },
  "message": "All gold prices retrieved successfully"
}
```

---

## Testing Tips

### 1. **Using cURL with Pretty Print**
```bash
curl -X GET "http://localhost:4000/api/gold/price" | jq
```

### 2. **Save Response to File**
```bash
curl -X GET "http://localhost:4000/api/gold/report/2508-0000002-5" -o gold_report.json
```

### 3. **Test Multiple Endpoints**
Create a bash script `test_gold_apis.sh`:
```bash
#!/bin/bash

BASE_URL="http://localhost:4000"
CUSTOMER_ID="2508-0000002-5"

echo "Testing Gold Sum APIs..."
echo "========================"

echo "1. Testing Current Gold Price..."
curl -s "$BASE_URL/api/gold/price" | jq '.success'

echo "2. Testing Gold Purchase Report..."
curl -s "$BASE_URL/api/gold/report/$CUSTOMER_ID" | jq '.success'

echo "3. Testing Gold Selling Report..."
curl -s "$BASE_URL/api/gold/selling-report/$CUSTOMER_ID" | jq '.success'

echo "4. Testing P2P Transfer Report..."
curl -s "$BASE_URL/api/gold/p2p-report/$CUSTOMER_ID" | jq '.success'

echo "5. Testing Gold Purchases List..."
curl -s "$BASE_URL/api/gold/purchases/$CUSTOMER_ID" | jq '.success'

echo "6. Testing All Gold Prices..."
curl -s "$BASE_URL/api/gold/all_price" | jq '.data.total_records'

echo "========================"
echo "All tests completed!"
```

Make it executable:
```bash
chmod +x test_gold_apis.sh
./test_gold_apis.sh
```

### 4. **Postman Collection**
Import these endpoints into Postman:
- Create a new collection named "Gold Sum Service"
- Set environment variable: `baseUrl = http://localhost:4000`
- Set environment variable: `customerId = 2508-0000002-5`

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "requestId": "gold-1234567890",
  "message": "Customer ID is required"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "requestId": "gold-1234567890",
  "error": "No gold purchases found for customer ID 2508-0000002-5",
  "message": "No gold purchases found"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "requestId": "gold-1234567890",
  "error": "Database query failed: ORA-00942: table or view does not exist",
  "message": "Failed to generate gold report"
}
```

---

## Database Tables & Column Mapping

### BUY_GOLD_TXN
Contains gold purchase transactions with CORE_BANKING_SEQNO field.

**Key Columns:**
- `TRANSACTION_ID` - Unique transaction identifier
- `CORE_BANKING_REF` - Core banking reference
- `CORE_BANKING_SEQNO` - **NEW** Core banking sequence number
- `DR_ACCOUNT_NO` - Debit account number
- `GOLD_WEIGHT` - Weight of gold in grams
- `PRICE_PER_GRAM` - Purchase price per gram
- `TOTAL_AMOUNT` - Total transaction amount
- `CURRENCY_CODE` - Currency (LAK, USD, etc.)
- `CR_CBK_SEQNO` - Credit core banking sequence
- `CREATED_AT` - Transaction date
- `STATUS` - Transaction status (COMPLETED, PENDING, FAILED)
- `CUSTOMER_ID` - Customer identifier

### SELL_GOLD_TRANSACTION
Contains gold selling transactions with CORE_BANKING_SEQNO field.

**Key Columns:**
- `TRANSACTION_ID` - Unique transaction identifier
- `CORE_BANKING_SEQNO` - **NEW** Core banking sequence number
- `DR_ACCOUNT_NO` - Debit account number
- `GOLD_WEIGHT` - Weight of gold sold
- `PRICE_PER_GRAM` - Selling price per gram
- `TOTAL_AMOUNT` - Total amount received
- `CURRENCY_CODE` - Currency
- `CREATED_AT` - Transaction date
- `CUSTOMER_ID` - Customer identifier

### P2P_TRANSACTION
Contains peer-to-peer gold transfers.

**Key Columns:**
- `TRANSACTION_ID` - Unique transaction identifier
- `CORE_BANKING_SEQNO` - Core banking sequence number
- `DR_ACCOUNT_NO` - Sender's account
- `DR_CURRENCY_CODE` - Sender's currency
- `CR_ACCOUNT_NO` - Receiver's account
- `CR_CURRENCY_CODE` - Receiver's currency
- `GOLD_WEIGHT` - Weight transferred
- `CREATED_AT` - Transfer date
- `CUSTOMER_ID` - Customer identifier

### EXCHANGE_RATE
Contains gold price information.

**Key Columns:**
- `CCY` - Currency code
- `EFFECT_FROM_DATE` - Effective date
- `BUY_RATE` - Bank buying rate
- `SELL_RATE` - Bank selling rate
- `MID_RATE` - Mid-market rate

---

## Quick Reference

| Endpoint | Method | Authentication | Purpose |
|----------|--------|----------------|---------|
| `/api/gold/report/:customerId` | GET | Public | Gold purchase report with profit/loss |
| `/api/gold/selling-report/:customerId` | GET | Public | Gold selling summary |
| `/api/gold/p2p-report/:customerId` | GET | Public | P2P transfer summary |
| `/api/gold/purchases/:customerId` | GET | Public | List of gold purchases |
| `/api/gold/price` | GET | Public | Current gold price |
| `/api/gold/all_price` | GET | Public | Complete price history |

---

**Generated:** 2025-01-23
**Version:** 1.0
**Service:** goldSumService.js
