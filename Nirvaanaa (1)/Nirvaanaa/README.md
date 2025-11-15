# Nirvaanaa - Handcrafted Elegance

A production-grade Next.js e-commerce platform for handmade embroidery bags and sarees. Built with modern web technologies and designed for elegance, performance, and scalability.

![Nirvaanaa](https://img.shields.io/badge/Nirvaanaa-Handcrafted%20Elegance-gold)
![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-38B2AC)

## 🌟 Features

### 🛍️ E-commerce Core
- **Product Catalog**: Rich product management with categories, tags, and variants
- **Shopping Cart**: Persistent cart with localStorage and server sync
- **Secure Checkout**: Stripe integration with webhook processing
- **Order Management**: Complete order lifecycle with status tracking
- **Inventory Management**: Real-time stock tracking and updates

### 🎨 Design & UX
- **Mobile-First**: Fully responsive design optimized for all devices
- **Elegant Branding**: Custom color palette with gold and beige themes
- **Smooth Animations**: Framer Motion powered interactions
- **Accessibility**: WCAG compliant with keyboard navigation
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

### 🔐 Authentication & Security
- **Multi-Provider Auth**: Email/password, Google, and Facebook OAuth
- **Role-Based Access**: User and admin role management
- **Secure Payments**: Stripe with webhook signature verification
- **Input Validation**: Comprehensive form validation with Zod
- **Password Security**: Bcrypt hashing for secure password storage

### 📧 Communication
- **Email Notifications**: Order confirmations and updates via Nodemailer
- **SMS Alerts**: Order status updates via Twilio
- **Contact Forms**: Customer inquiry handling with auto-responses
- **Admin Notifications**: Real-time alerts for new orders and inquiries

### 🛠️ Admin Dashboard
- **Sales Analytics**: Revenue tracking and performance metrics
- **Product Management**: CRUD operations with image uploads
- **Order Processing**: Status updates and tracking management
- **Customer Management**: User profiles and order history
- **Content Management**: Announcements and promotional banners

### 🚀 Performance & SEO
- **Server-Side Rendering**: SEO-friendly pages with dynamic meta tags
- **Image Optimization**: Cloudinary integration with lazy loading
- **Caching**: Efficient data caching and optimization
- **Lighthouse Score**: Optimized for 95+ desktop and 85+ mobile scores

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: App Router with server components
- **React 18**: Latest features with hooks and context
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Icons**: Comprehensive icon library

### Backend
- **MongoDB Atlas**: Cloud database with Mongoose ODM
- **NextAuth.js**: Authentication with multiple providers
- **Stripe**: Payment processing and webhooks
- **Cloudinary**: Image upload and optimization
- **Nodemailer**: Email service integration
- **Twilio**: SMS notifications

### Development
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Unit testing framework
- **Cypress**: End-to-end testing
- **TypeScript**: Type safety (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Stripe account
- Cloudinary account
- Twilio account (optional)
- Email service (Gmail, SendGrid, etc.)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/nirvaanaa-ecommerce.git
cd nirvaanaa-ecommerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment example file and configure your variables:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nirvaanaa

# NextAuth.js
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Admin Configuration
ADMIN_EMAILS=libramank@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

### 4. Database Setup
Run the seed script to populate your database with sample data:

```bash
npm run seed
```

This will create:
- Admin user (libramank@gmail.com / admin123)
- Sample user (john@example.com / password123)
- Sample products with images
- Sample orders and announcements

### 5. Development Server
Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard
   - Deploy

3. **Environment Variables in Vercel**
   Add all your environment variables from `.env.local` to Vercel's environment variables section.

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel dashboard
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your domain

### Stripe Webhook Configuration

1. **Get Webhook Endpoint**
   Your webhook URL will be: `https://yourdomain.com/api/webhooks/stripe`

2. **Configure in Stripe Dashboard**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy the webhook secret and add to `STRIPE_WEBHOOK_SECRET`

### Cloudinary Setup

1. **Create Cloudinary Account**
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Get your cloud name, API key, and secret

2. **Configure Upload Presets**
   - Go to Settings > Upload
   - Create upload preset for Nirvaanaa
   - Set folder to `nirvaanaa`

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📁 Project Structure

```
nirvaanaa/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product pages
│   ├── cart/              # Cart pages
│   ├── checkout/          # Checkout flow
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   ├── home/             # Homepage components
│   ├── products/         # Product components
│   ├── cart/             # Cart components
│   ├── auth/             # Auth components
│   └── admin/            # Admin components
├── lib/                  # Utility libraries
├── models/               # Mongoose models
├── utils/                # Helper functions
├── scripts/              # Database scripts
└── public/               # Static assets
```

## 🔧 Configuration

### Customization

1. **Brand Colors**: Edit `tailwind.config.js` to customize the color palette
2. **Fonts**: Update font imports in `app/layout.js`
3. **SEO**: Modify metadata in individual pages
4. **Email Templates**: Customize email templates in `utils/email.js`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Your application URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `EMAIL_SERVER_HOST` | SMTP server host | Yes |
| `EMAIL_SERVER_USER` | SMTP username | Yes |
| `EMAIL_SERVER_PASSWORD` | SMTP password | Yes |
| `ADMIN_EMAILS` | Comma-separated admin emails | Yes |

## 🎯 Performance Optimization

### Lighthouse Score Targets
- **Desktop**: >95
- **Mobile**: >85
- **Accessibility**: >95
- **Best Practices**: >95
- **SEO**: >95

### Optimization Features
- Image optimization with Cloudinary
- Code splitting and lazy loading
- Efficient caching strategies
- Minified CSS and JavaScript
- Optimized fonts and assets

## 🔒 Security Features

- Password hashing with bcrypt
- Input validation with Zod
- CSRF protection
- XSS prevention
- Secure headers configuration
- Stripe webhook signature verification
- Role-based access control

## 📞 Support

For support and questions:

- **Email**: libramank@gmail.com
- **Documentation**: [docs.nirvaanaa.com](https://docs.nirvaanaa.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/nirvaanaa-ecommerce/issues)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for seamless deployment
- **Stripe** for payment processing
- **Cloudinary** for image management
- **TailwindCSS** for the utility-first CSS framework

---

**Made with ❤️ for handcrafted elegance**

---

## Invoices: Templates, Placeholders, and Testing

### Endpoints

- Generate PDF from latest template: `POST /api/generate-invoice` with `{ orderId }`
- Test-render DOCX with sample data: `GET /api/test-invoice`

### Placeholders supported in .docx

- `{{customer_name}}`
- `{{customer_address}}`
- `{{order_date}}`
- `{{shipping_method}}`
- `{{product_table}}` (HTML rows injected)
- `{{total_price}}`

Missing variables are rendered as empty strings.

### Sample template snippet

```
Invoice

Customer: {{customer_name}}
Address: {{customer_address}}
Order Date: {{order_date}}
Shipping: {{shipping_method}}

Items:
<table border="1" width="100%">
  <tr>
    <th>Product</th><th>Qty</th><th>Price</th><th>Total</th>
  </tr>
  {{product_table}}
</table>

Grand Total: {{total_price}}
```

### Admin template management

- Upload/list/delete via Admin → Invoice Templates
- API: `/api/admin/invoice-template` and `/api/admin/invoice-template/:id`
- Files stored under `uploads/invoices` (configurable via `INVOICE_UPLOAD_DIR`)

### Emailing PDFs to admins

`/api/generate-invoice` emails the PDF to `ADMIN_EMAILS` using SMTP (`EMAIL_SERVER_*`). If emailing fails, the PDF is still returned.

### PDF conversion dependency

Install LibreOffice on the host for DOCX→PDF via `libreoffice-convert`.

### Dummy checkout flow

1) Click “Dummy Pay” in cart
2) Redirects to `/checkout/success?orderId=<id>`
3) Click “Download Invoice (PDF)” to generate and download, and email admins