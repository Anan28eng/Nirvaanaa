# Invoice Template Fix Guide

## Issue
The invoice template has duplicate close tags causing errors like:
```
Error: Duplicate close tag, expected one close tag
The tag ending with "rice}}" has duplicate close tags
```

## Solution

The template file (`public/invoice-template.docx`) has malformed placeholders. Here's how to fix it:

### Valid Placeholders
Use these placeholders in your template (single opening and closing braces):

- `{{customer_name}}` - Customer's name
- `{{customer_address}}` - Full shipping address
- `{{customer_email}}` - Customer's email
- `{{customer_phone}}` - Customer's phone
- `{{order_number}}` - Order number (e.g., NV241101001)
- `{{order_date}}` - Order date (formatted)
- `{{order_time}}` - Order time (formatted)
- `{{shipping_method}}` - Shipping method name
- `{{shipping_cost}}` - Shipping cost (₹XX)
- `{{subtotal}}` - Subtotal before tax (₹XX)
- `{{tax}}` - Tax amount (₹XX)
- `{{discount}}` - Discount amount (₹XX)
- `{{total_price}}` - Total amount (₹XX)
- `{{product_table}}` - HTML table of products
- `{{item_count}}` - Total number of items
- `{{payment_method}}` - Payment method used
- `{{payment_status}}` - Payment status

### Common Mistakes to Avoid

❌ **WRONG**: `{{price}}` or `{{price}}` (extra closing braces)
✅ **CORRECT**: `{{price}}`

❌ **WRONG**: `{{{{price}}}}` (nested braces)
✅ **CORRECT**: `{{price}}`

❌ **WRONG**: `{{price}}` (spaces inside)
✅ **CORRECT**: `{{price}}`

### How to Fix Your Template

1. Open `public/invoice-template.docx` in Microsoft Word or LibreOffice
2. Search for all instances of `{{` and `}}`
3. Ensure each placeholder has exactly:
   - One opening `{{`
   - One closing `}}`
   - No spaces between braces and placeholder name
   - No nested braces

4. Common fixes:
   - Replace `{{price}}` with `{{price}}`
   - Replace `{{{{price}}}}` with `{{price}}`
   - Replace `{{ price }}` with `{{price}}`

### Testing

After fixing the template, test it by:
1. Visiting `/test-invoice` to download a test invoice
2. Checking that the invoice generates without errors
3. Verifying all placeholders are replaced with actual data

### Sample Template Structure

```
INVOICE

Order Number: {{order_number}}
Date: {{order_date}} {{order_time}}

Customer Information:
{{customer_name}}
{{customer_address}}
Email: {{customer_email}}
Phone: {{customer_phone}}

Items:
{{product_table}}

Subtotal: {{subtotal}}
Shipping: {{shipping_cost}}
Tax: {{tax}}
Discount: {{discount}}
Total: {{total_price}}

Payment Method: {{payment_method}}
Payment Status: {{payment_status}}
```

Make sure each placeholder uses exactly `{{placeholder_name}}` format.

