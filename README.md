# 🎬 UGC Platform - Content Creator Bounty Marketplace

**Built for DAHACKS 4.0 Hackathon**

A modern platform connecting brands with content creators through AI-powered bounty campaigns. Businesses create bounties for user-generated content (UGC), and creators submit videos from YouTube, TikTok, and Instagram to earn rewards based on view performance.

---

## 🚀 Project Overview

UGC Platform revolutionizes the way brands collaborate with content creators. Instead of traditional fixed-rate partnerships, brands can create dynamic bounties with view-based pricing, ensuring they only pay for actual engagement. Our AI-powered validation system ensures quality content that truly represents the brand.

### Key Features

- **🤖 AI-Powered Content Validation**: Uses Google Gemini AI to automatically validate submissions against bounty requirements
- **📊 Real-Time View Tracking**: Integrates with YouTube Data API and Peekalink for TikTok to track live view counts
- **💰 Dynamic Payout System**: Automatic calculation of earnings based on views (rate per 1k views)
- **👥 Dual-Role Platform**: Separate experiences for creators and businesses
- **🎯 Multi-Platform Support**: YouTube, TikTok, and Instagram integration
- **📈 Progress Tracking**: Real-time dashboard showing bounty progress, submissions, and earnings
- **🔐 Secure Authentication**: Powered by Clerk for enterprise-grade user management
- **🎨 Modern UI/UX**: Beautiful, responsive design with dark/light mode support

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework with server-side rendering
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Shadcn/ui** - Beautiful, accessible component library

### Backend & Services
- **Supabase** - PostgreSQL database with real-time capabilities
- **Clerk** - Authentication and user management
- **Google Gemini AI** - Content validation and moderation
- **YouTube Data API v3** - Video metadata and view tracking
- **Peekalink API** - TikTok video data extraction
- **LinkPreview.net API** - Link metadata extraction

### Infrastructure
- **Vercel** - Hosting and deployment
- **Supabase Storage** - File uploads (logos, assets)

---

## 📱 Platform Features

### For Businesses
- **Create Bounties**: Set up campaigns with custom requirements, budgets, and rates
- **Upload Brand Assets**: Add company logos and branding
- **Monitor Progress**: Track submission counts, view totals, and budget usage
- **Approve/Reject Submissions**: Review and manage creator submissions
- **Billing Dashboard**: Manage funds and track spending

### For Creators
- **Browse Feed**: Discover available bounties with search and filtering
- **Submit Content**: Upload videos from YouTube, TikTok, or Instagram
- **Track Earnings**: Monitor submission status, views, and earned amounts
- **Profile Management**: Build your creator portfolio
- **Payout System**: Request and manage earnings

---

## 🎯 How It Works

### 1. Bounty Creation
Businesses create bounties specifying:
- Campaign name and description
- Requirements (e.g., "Show our product in use")
- Total budget
- Rate per 1,000 views
- Company branding

### 2. Content Submission
Creators browse the feed and submit videos by:
- Providing a video URL (YouTube/TikTok/Instagram)
- Platform automatically extracts metadata
- System validates URL format and platform

### 3. AI Validation
Our AI system validates submissions by:
- Analyzing video content against bounty requirements
- Checking for requirement fulfillment (product placement, mentions, etc.)
- Providing feedback for rejected submissions

### 4. View Tracking
Automatic view tracking:
- Real-time synchronization with platform APIs
- Calculates earnings: `(views / 1000) × rate_per_1k_views`
- Updates progress and payout amounts

### 5. Payout & Completion
- Creators earn based on approved submission views
- Bounties complete when budget is fully utilized
- Real-time progress tracking and notifications

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Clerk account
- Google Gemini API key
- YouTube Data API key
- LinkPreview.net API key
- Peekalink API key (optional, for TikTok)

### Environment Variables

Create a `.env.local` file in the `ugc-platform` directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI & APIs
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
LINKPREVIEW_API_KEY=your_linkpreview_api_key
PEEKALINK_API_KEY=your_peekalink_api_key

# Clerk Webhook (for production)
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
```

### Installation Steps

1. **Navigate to the platform directory:**
   ```bash
   cd ugc-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase:**
   - Run migrations from `supabase/migrations/` in your Supabase project
   - Enable Row Level Security (RLS) policies
   - Create storage buckets for assets

4. **Configure Clerk:**
   - Set up Clerk application
   - Configure webhook endpoint: `/api/webhooks/clerk`
   - Add environment variables

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
ugc-platform/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── feed/              # Bounty feed
│   │   ├── profile/           # User profiles
│   │   ├── creator/           # Creator-specific pages
│   │   ├── business/          # Business-specific pages
│   │   └── onboarding/        # Role selection
│   ├── components/            # React components
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase-server.ts # Server-side Supabase client
│   │   ├── supabase-utils.ts  # Database utilities
│   │   └── bounties.ts        # Bounty management
│   └── types/                 # TypeScript definitions
├── supabase/
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

---

## 🔑 Key API Endpoints

### Bounties
- `GET /api/bounties` - List all bounties
- `POST /api/bounties` - Create a new bounty
- `GET /api/bounties/[id]` - Get bounty details
- `GET /api/bounties/[id]/submissions` - Get submissions for a bounty

### Submissions
- `GET /api/submissions` - Get user's submissions
- `POST /api/submit-bounty-item` - Submit content to a bounty
- `PUT /api/submissions/[id]` - Update submission status

### Validation
- `POST /api/validate-bounty` - Validate video against requirements (AI-powered)

### Views Tracking
- `GET /api/youtube-views?url=...` - Get YouTube video views
- `GET /api/tiktok-views?url=...` - Get TikTok video views

### Payments & Wallet
- `POST /api/payments/create-intent` - Create Stripe payment intent for adding funds
- `GET /api/wallet/balance` - Get current wallet balance
- `GET /api/transactions` - Get transaction history
- `POST /api/payouts/create` - Create payout request (creators)
- `GET /api/payouts` - Get payout history
- `POST /api/webhooks/stripe` - Stripe webhook handler for payment events

---

## 🎨 UI/UX Highlights

- **Responsive Design**: Mobile-first approach, works seamlessly on all devices
- **Dark/Light Mode**: System preference detection with manual toggle
- **Smooth Animations**: Framer Motion for polished interactions
- **Accessibility**: WCAG compliant components from Shadcn/ui
- **Real-time Updates**: Live data synchronization across platform
- **Loading States**: Comprehensive loading and error handling

---

## 🔐 Security Features

- **Authentication**: Clerk-powered secure authentication
- **Authorization**: Role-based access control (Creator/Business)
- **Row Level Security**: Supabase RLS policies for data protection
- **Service Role Isolation**: Server-side operations use service role key
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Protection**: Secure API endpoint configuration

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The platform is optimized for Vercel's edge network and serverless functions.

### Database Migrations

Run Supabase migrations in your production database:
```bash
# Using Supabase CLI
supabase db push
```

---

## 📊 Database Schema

Key tables:
- `bounties` - Campaign information
- `submissions` - Creator content submissions
- `user_profiles` - User account data
- `platform_views` - View tracking cache

All tables use UUID primary keys and include timestamps for audit trails.

---

## 🤝 Contributing

This project was built for DAHACKS 4.0. For questions or improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

This project was created for DAHACKS 4.0 Hackathon.

---

## 👥 Team

Built with ❤️ for DAHACKS 4.0

---

## 🎯 Future Enhancements

### ✅ Completed Features
- [x] **TikTok and Instagram direct API integration** - Full API integration with TikTok (Direct API, Research API, Peekalink fallback) and Instagram (Graph API, oEmbed fallback)
- [x] **Advanced analytics dashboard** - Comprehensive analytics with time series charts, platform breakdowns, earnings tracking, and trend analysis for both creators and businesses

### 🚧 In Progress / Planned
- [x] **Payment gateway integration (Clerk)** - UI components ready, needs full payment processing implementation
- [ ] **Email notifications** - Automated emails for submission approvals/rejections, bounty completions, and earnings updates
- [ ] **Creator reputation system** - Rating and review system based on submission quality, approval rates, and performance metrics
- [ ] **Bounty recommendation engine** - AI-powered matching system to suggest relevant bounties to creators based on their content style and past performance
- [ ] **Real-time chat system** - Direct messaging between creators and businesses for collaboration and feedback
- [ ] **Mobile app (React Native)** - Native mobile application for iOS and Android

### 💡 Additional Enhancement Ideas
- [ ] **Advanced search and filtering** - Enhanced bounty discovery with tags, categories, and smart filters
- [ ] **Bulk submission management** - Tools for creators to submit multiple videos at once
- [ ] **Content scheduling** - Schedule submissions for optimal timing
- [ ] **Performance insights** - Detailed analytics on video performance, engagement rates, and ROI
- [ ] **Multi-language support** - Internationalization for global user base
- [ ] **API for third-party integrations** - Public API for external tools and integrations
- [ ] **Webhook system** - Real-time webhooks for submission status changes and bounty updates
- [ ] **Advanced moderation tools** - Enhanced AI validation with custom rules and thresholds
- [ ] **Creator portfolio showcase** - Public profiles showcasing creator's best work and statistics
- [ ] **Bounty templates** - Pre-built templates for common campaign types

---

## 🐛 Known Issues & Limitations

- TikTok API requires Peekalink subscription for full functionality
- Instagram API access is limited (using LinkPreview as fallback)
- Real-time view updates may have slight delays depending on platform APIs

---

## 📞 Support

For hackathon-related questions or issues, please refer to the project documentation or contact the team.

---

**Built with Next.js, Supabase, Clerk, and Google Gemini AI**

*Making UGC campaigns smarter, fairer, and more efficient* 🚀

