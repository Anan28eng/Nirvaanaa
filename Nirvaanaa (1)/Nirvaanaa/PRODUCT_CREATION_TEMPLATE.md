# Product Creation Template

This template provides a comprehensive guide for creating products in the Nirvaanaa admin dashboard.

## 📋 Required Fields

### Basic Information
- **Product Title** * (Required)
  - Example: "Handcrafted Embroidered Tote Bag"
  - Max 100 characters
  - Will be used to generate slug automatically

- **Price (₹)** * (Required)
  - Example: `1299`
  - Minimum: 0
  - Price in Indian Rupees (paise will be calculated automatically)

- **Compare Price (₹)** (Optional)
  - Example: `1599`
  - Used to show discount percentage
  - Should be higher than regular price

- **Discount (%)** (Optional)
  - Example: `15`
  - Range: 0-100
  - Alternative to compare price

- **Category** * (Required)
  - Select from dropdown:
    - `bangle-box`
    - `clutch`
    - `gift-hampers`
    - `goggle-cover`
    - `kitty-bag`
    - `long-tote-bag`
    - `picnic-bag`
    - `potli-purse`
    - `sling-bags`
    - `velvet-clutch-with-flaps`

- **Stock Quantity** * (Required)
  - Example: `25`
  - Minimum: 0
  - Default: 10

- **SKU** (Optional)
  - Example: `ETB001`
  - Unique identifier
  - Auto-generated if not provided

## 📝 Product Details

### Description
- **Full Description** * (Required)
  - Detailed product description
  - Max 2000 characters
  - Example:
    ```
    A beautiful handcrafted tote bag featuring intricate embroidery work. 
    Perfect for daily use or special occasions. Made with premium cotton 
    fabric and detailed with traditional Indian embroidery patterns.
    ```

- **Short Description** (Optional)
  - Brief summary
  - Max 200 characters
  - Example: `Handcrafted tote bag with traditional embroidery`

### Tags
- Comma-separated or click suggested tags
- Examples: `handmade`, `embroidery`, `cotton`, `traditional`, `featured`, `new`
- Suggested tags:
  - Category tags: `bangle-box`, `clutch`, `gift-hampers`, etc.
  - Feature tags: `featured`, `new`, `handmade`, `traditional`

## 🖼️ Images

### Product Images
- Upload via drag & drop or file picker
- Multiple images supported
- Images are automatically uploaded to Cloudinary
- Each image requires:
  - **URL**: Auto-generated from Cloudinary
  - **Alt Text**: Descriptive text for accessibility
  - **Public ID**: Auto-generated

**Image Upload Tips:**
- Recommended size: 800x800px minimum
- Formats: JPG, PNG, WebP
- Max file size: 10MB per image
- First image is used as main/featured image

## 🎨 Color Variants (Optional)

If your product comes in multiple colors:

```json
[
  {
    "name": "Cream",
    "hex": "#f5f1eb",
    "images": ["https://cloudinary.com/image1.jpg"]
  },
  {
    "name": "Beige",
    "hex": "#e0d5c7",
    "images": ["https://cloudinary.com/image2.jpg"]
  }
]
```

- **Name**: Color name (e.g., "Cream", "Beige", "Red")
- **Hex**: Color code in format `#RRGGBB`
- **Images**: Array of image URLs for this color variant

## 📐 Dimensions & Weight (Optional)

### Dimensions
- **Length**: Number (e.g., `35`)
- **Width**: Number (e.g., `40`)
- **Height**: Number (e.g., `15`)
- **Unit**: `cm` or `inches` (default: `cm`)

### Weight
- **Value**: Number (e.g., `450`)
- **Unit**: `g`, `kg`, or `lbs` (default: `g`)

## 🏷️ Additional Information

### Materials (Optional)
- Array of material names
- Example: `["Cotton", "Embroidered thread", "Brass hardware"]`

### Subcategory (Optional)
- Additional categorization
- Example: `tote`, `shoulder`, `evening`

### Care Instructions (Optional)
- Max 500 characters
- Example: `Hand wash only. Do not bleach. Dry in shade.`

### Made In (Optional)
- Default: `India`
- Example: `India`, `Handcrafted in Rajasthan`

### Is Handmade (Optional)
- Boolean: `true` or `false`
- Default: `true`

## 🔍 SEO Settings (Optional)

### Meta Title
- Max 60 characters
- Example: `Embroidered Tote Bag - Handcrafted Elegance`
- If not provided, uses product title

### Meta Description
- Max 160 characters
- Example: `Discover our beautiful handcrafted embroidered tote bag. Perfect blend of tradition and style.`

### Keywords
- Array of SEO keywords
- Example: `["embroidered bag", "handmade tote", "traditional embroidery"]`

## ✅ Publishing Options

### Published
- Boolean: `true` or `false`
- Default: `true`
- Unpublished products won't appear on the website

### Featured
- Boolean: `true` or `false`
- Default: `false`
- Featured products appear in featured sections

## 📊 Complete Example

```json
{
  "title": "Handcrafted Embroidered Tote Bag",
  "description": "A beautiful handcrafted tote bag featuring intricate embroidery work. Perfect for daily use or special occasions. Made with premium cotton fabric and detailed with traditional Indian embroidery patterns.",
  "shortDescription": "Handcrafted tote bag with traditional embroidery",
  "price": 1299,
  "comparePrice": 1599,
  "discount": 0,
  "stock": 25,
  "sku": "ETB001",
  "category": "long-tote-bag",
  "subcategory": "tote",
  "tags": ["handmade", "embroidery", "cotton", "traditional", "featured"],
  "materials": ["Cotton", "Embroidered thread"],
  "dimensions": {
    "length": 35,
    "width": 40,
    "height": 15,
    "unit": "cm"
  },
  "weight": {
    "value": 450,
    "unit": "g"
  },
  "colorVariants": [
    {
      "name": "Cream",
      "hex": "#f5f1eb",
      "images": ["https://cloudinary.com/cream-tote.jpg"]
    },
    {
      "name": "Beige",
      "hex": "#e0d5c7",
      "images": ["https://cloudinary.com/beige-tote.jpg"]
    }
  ],
  "images": [
    {
      "url": "https://cloudinary.com/tote-bag-1.jpg",
      "alt": "Embroidered Tote Bag Front View",
      "publicId": "nirvaanaa/tote-bag-1"
    },
    {
      "url": "https://cloudinary.com/tote-bag-2.jpg",
      "alt": "Embroidered Tote Bag Back View",
      "publicId": "nirvaanaa/tote-bag-2"
    }
  ],
  "published": true,
  "featured": true,
  "isHandmade": true,
  "madeIn": "India",
  "careInstructions": "Hand wash only. Do not bleach. Dry in shade.",
  "seo": {
    "metaTitle": "Embroidered Tote Bag - Handcrafted Elegance",
    "metaDescription": "Discover our beautiful handcrafted embroidered tote bag. Perfect blend of tradition and style.",
    "keywords": ["embroidered bag", "handmade tote", "traditional embroidery"]
  }
}
```

## 🚀 Quick Start Checklist

- [ ] Product title entered
- [ ] Price set (minimum ₹50 for Stripe)
- [ ] Category selected
- [ ] Stock quantity set
- [ ] Description written
- [ ] At least one image uploaded
- [ ] Tags added (optional but recommended)
- [ ] Published status set
- [ ] Featured status set (if applicable)

## 💡 Best Practices

1. **Images**: Use high-quality, well-lit product photos
2. **Descriptions**: Be detailed but concise
3. **Tags**: Use relevant tags for better searchability
4. **SEO**: Fill in meta title and description for better search rankings
5. **Stock**: Keep stock updated to avoid overselling
6. **Pricing**: Use compare price to show value
7. **Categories**: Choose the most appropriate category
8. **Variants**: Add color variants if product comes in multiple colors

## ⚠️ Important Notes

- Slug is auto-generated from title (lowercase, hyphens)
- SKU must be unique if provided
- Price must be at least ₹50 (5000 paise) for Stripe payments
- Stock cannot be negative
- Images are uploaded to Cloudinary automatically
- Product must be published to appear on website





