# Lords of Esport Platform

A fully functional VR esports league platform with user authentication, tournament management, and payment processing.

**Rule the Virtual Realm** - Where VR warriors forge their legends in the ultimate Population One battleground.

## 🚀 Features

- **User Authentication** - Supabase Auth with email/password and social logins
- **Tournament Management** - Create, manage, and register for tournaments
- **Payment Processing** - Stripe integration for entry fees
- **Real-time Database** - PostgreSQL with real-time subscriptions
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Type Safety** - Full TypeScript support

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)
- A Stripe account (test mode is fine)
- A Resend account for emails (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd vr-league-starter

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings > API to get your project URL and anon key
3. Go to SQL Editor and run the schema from `database/schema.sql`

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual values
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── AuthForm.tsx       # Authentication form
│   ├── Layout.tsx         # Main layout component
│   └── TournamentCard.tsx # Tournament display card
├── lib/                   # Utility libraries
│   └── supabase.ts        # Supabase client and helpers
database/
└── schema.sql             # Database schema for Supabase
```

## 🔧 Configuration

### Supabase Setup

1. **Create Project**: Sign up at supabase.com and create a new project
2. **Run Schema**: Copy and paste the contents of `database/schema.sql` into the SQL Editor
3. **Configure Auth**: 
   - Go to Authentication > Settings
   - Enable email confirmations if desired
   - Add your domain to redirect URLs
4. **Set up RLS**: Row Level Security policies are included in the schema

### Stripe Setup

1. **Create Account**: Sign up at stripe.com
2. **Get API Keys**: Go to Developers > API Keys
3. **Test Mode**: Use test keys for development
4. **Webhooks**: Set up webhooks for production (endpoint: `/api/webhooks/stripe`)

### Email Setup (Optional)

1. **Resend Account**: Sign up at resend.com
2. **Verify Domain**: Add and verify your sending domain
3. **API Key**: Get your API key from the dashboard

## 🚀 Deployment

### Deploy to Vercel

1. **Connect Repository**: Import your project to Vercel
2. **Environment Variables**: Add all environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy your application

### Database Hosting

- **Development**: Use Supabase free tier
- **Production**: Upgrade to Supabase Pro or use dedicated PostgreSQL

## 📊 Database Schema

The included schema provides:

- **User Management**: Profiles, authentication, roles
- **Tournament System**: Tournaments, registrations, matches
- **Team Management**: Teams, members, invitations
- **Payment Tracking**: Stripe integration, transaction history
- **Statistics**: Player stats, leaderboards, rankings
- **Communication**: Notifications, messaging

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **Authentication**: Secure user authentication with Supabase
- **Payment Security**: PCI-compliant payments via Stripe
- **Input Validation**: TypeScript and Zod validation
- **HTTPS**: Enforced secure connections

## 🎮 Customization

### Adding New Tournament Types

1. Update the `tournament_type` enum in the database
2. Add handling in `TournamentCard.tsx`
3. Update tournament creation forms

### Custom Styling

- Modify `tailwind.config.js` for custom colors/themes
- Update component styles in individual files
- Add custom CSS in `globals.css`

### Additional Features

- **Mobile App**: Use React Native with shared components
- **Real-time Chat**: Add Supabase real-time subscriptions
- **Streaming Integration**: Connect with Twitch/YouTube APIs
- **Advanced Analytics**: Add custom tracking and reporting

## 🐛 Troubleshooting

### Common Issues

1. **Supabase Connection**: Check URL and API keys
2. **Database Errors**: Ensure schema is properly applied
3. **Authentication Issues**: Verify redirect URLs and email settings
4. **Payment Failures**: Check Stripe keys and webhook configuration

### Development Tips

- Use Supabase local development for offline work
- Test payments with Stripe test cards
- Monitor real-time database changes in Supabase dashboard
- Use browser dev tools for debugging authentication flows

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Community**: Join our Discord server for community support

---

Built with ❤️ for the VR esports community

