# Hope First Wellness — Patient Intake Wizard

A production-ready, config-driven patient intake and booking wizard built with Next.js 14+, TypeScript, Tailwind CSS, React Hook Form, Zod, Stripe, and DrChrono integration.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your actual keys

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the intake wizard.

## Architecture Overview

```
hope-first-intake/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, fonts)
│   ├── page.tsx                  # Main wizard page
│   ├── globals.css               # Tailwind base + custom styles
│   ├── admin/
│   │   └── drchrono/page.tsx     # DrChrono connect/status admin page
│   └── api/
│       ├── stripe/               # Stripe SetupIntent endpoints
│       ├── drchrono/
│       │   ├── availability/     # Availability proxy
│       │   ├── auth-url/         # Generate OAuth authorization URL
│       │   ├── callback/         # OAuth callback (code → tokens)
│       │   ├── status/           # Connection status check
│       │   └── disconnect/       # Clear stored tokens
│       └── submit/               # Final submission endpoint
├── components/wizard/
│   ├── WizardShell.tsx           # Main wizard container + routing
│   ├── WizardProgress.tsx        # Step progress bar
│   ├── WizardNavigation.tsx      # Back/Next buttons
│   ├── StepRenderer.tsx          # Renders a step's fields with validation
│   ├── DisqualificationScreen.tsx # Stop screen
│   ├── ConfirmationScreen.tsx    # Final confirmation
│   └── fields/                   # Individual field type components
│       ├── FieldRenderer.tsx     # Dispatches to correct field component
│       ├── TextField.tsx
│       ├── TextareaField.tsx
│       ├── EmailField.tsx
│       ├── PhoneField.tsx
│       ├── DateField.tsx
│       ├── AddressField.tsx
│       ├── RadioGroupField.tsx
│       ├── CheckboxGroupField.tsx
│       ├── SelectField.tsx
│       ├── AcknowledgmentField.tsx
│       ├── ContactGroupField.tsx
│       ├── CalendarField.tsx
│       ├── ConsentFormsField.tsx
│       └── PaymentField.tsx
├── config/
│   ├── wizard-steps.ts          # ⭐ ALL wizard steps, fields, and rules
│   ├── branding.ts              # Colors, logo, text
│   └── consent-forms.ts         # Consent form definitions
├── lib/
│   ├── wizard/
│   │   ├── types.ts             # Wizard config & state types
│   │   ├── engine.ts            # ⭐ Branching & eligibility engine
│   │   └── context.tsx          # React context for wizard state
│   ├── validation/
│   │   └── schemas.ts           # Dynamic Zod schema generation
│   └── integrations/
│       ├── drchrono/
│       │   ├── types.ts         # DrChrono API types
│       │   ├── client.ts        # API client (mock-aware, auto-refreshing)
│       │   ├── oauth.ts         # OAuth flow: authorize, exchange, refresh
│       │   ├── mock.ts          # Mock availability data
│       │   ├── field-mapping.ts # ⭐ Wizard → DrChrono field mapping
│       │   └── token-store/
│       │       ├── types.ts     # TokenStore interface
│       │       ├── index.ts     # Store factory (dev vs production)
│       │       ├── local-file-store.ts  # Encrypted file store (dev only)
│       │       └── production-store.ts  # Placeholder for durable KV store
│       └── stripe/
│           ├── server.ts        # Server-side Stripe operations
│           └── client.tsx       # Client-side Stripe loader
├── types/
│   └── index.ts                 # Core data types
└── public/
    └── consent/                 # Place consent PDF files here
```

## What's Mocked vs. Production-Ready

| Feature | Status | Notes |
|---------|--------|-------|
| Wizard UI & navigation | Production-ready | Fully functional config-driven wizard |
| Form validation | Production-ready | Zod schemas generated from config |
| Branching/eligibility engine | Production-ready | All business rules implemented |
| Disqualification flows | Production-ready | All stop screens with messaging |
| Stripe payment capture | Production-ready | Needs real Stripe keys in `.env.local` |
| DrChrono OAuth flow | Production-ready | Real OAuth 2.0 with auto-refresh |
| Calendar/scheduling | Mock mode | Uses deterministic mock slots; wire to DrChrono for real data |
| DrChrono patient creation | Mock mode | Set `DRCHRONO_MOCK_MODE=false` and connect via `/admin/drchrono` |
| DrChrono appointment creation | Mock mode | Same as above |
| Consent document upload | Placeholder | Document upload endpoint exists but needs DrChrono implementation |
| Payment metadata sync | Placeholder | Architecture ready, needs DrChrono custom field mapping |

## Connecting DrChrono

### Local development

1. Set `DRCHRONO_MOCK_MODE=false` in `.env.local`
2. Fill in `DRCHRONO_CLIENT_ID`, `DRCHRONO_CLIENT_SECRET` from [DrChrono API Management](https://app.drchrono.com/api-management/)
3. Set `DRCHRONO_REDIRECT_URI=http://localhost:3000/api/drchrono/callback`
4. Set `TOKEN_STORE_SECRET` to any random string of 32+ characters
5. Set `DRCHRONO_DOCTOR_ID`, `DRCHRONO_OFFICE_ID`, `DRCHRONO_EXAM_ROOM`
6. Start the dev server: `npm run dev`
7. Visit [http://localhost:3000/admin/drchrono](http://localhost:3000/admin/drchrono)
8. Click "Connect DrChrono" — you'll be redirected to DrChrono to authorize
9. After authorization, you're redirected back and tokens are stored in an encrypted local file

Tokens auto-refresh when they're within 5 minutes of expiry. If the refresh token is ever invalidated, reconnect via the admin page.

### Vercel production

In production, the local filesystem is ephemeral — tokens stored in a file will be lost between serverless invocations. You **must** provide a durable external key-value store.

1. Choose a KV provider: [Upstash Redis](https://upstash.com/), [Vercel KV](https://vercel.com/docs/storage/vercel-kv), or similar
2. Implement the `TokenStore` interface in `lib/integrations/drchrono/token-store/production-store.ts`
3. Set the provider's env vars (e.g. `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
4. Update `DRCHRONO_REDIRECT_URI` to your production domain
5. Deploy and visit `/admin/drchrono` to connect

## Why Not Store Tokens in Environment Variables?

DrChrono OAuth access tokens expire every 48 hours. When you refresh them, DrChrono issues a **new** refresh token and invalidates the old one (refresh token rotation). This means:

- **Access tokens** can't be env vars because they expire frequently.
- **Refresh tokens** can't be env vars because they change on every refresh.
- **Local files** work for development but not for Vercel serverless, where each invocation may run in a fresh container with no shared filesystem.
- **A durable external store** (Redis, KV) is the correct production solution. It's a single key-value pair, not a traditional database.

## Key Configuration Files

### Adding a new question

Edit `config/wizard-steps.ts`. Add a new field to an existing step's `fields` array:

```typescript
{
  id: "myNewField",
  type: "radio",
  label: "My new question",
  required: true,
  options: [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
  ],
}
```

### Adding a new step

Add a new step object to the `steps` array in `config/wizard-steps.ts`:

```typescript
{
  id: "my-new-step",
  title: "Step Title",
  description: "Step description",
  fields: [ /* field configs */ ],
  rules: [ /* optional branching rules */ ],
}
```

### Changing branching logic

Edit the `rules` array on any step in `config/wizard-steps.ts`:

```typescript
rules: [
  {
    field: "fieldId",
    operator: "equals",    // equals, not_equals, includes, includes_any_except, age_under, state_not_in
    value: "some-value",
    action: "disqualify",  // disqualify, skip_to, next
    message: "Your disqualification message",
  },
]
```

To add new rule operators, extend `evaluateCondition()` in `lib/wizard/engine.ts`.

### Changing disqualification messages

Edit the `message` property on any rule with `action: "disqualify"` in `config/wizard-steps.ts`.

### Editing consent forms

Edit `config/consent-forms.ts`. Add/remove/reorder form entries. Place PDFs in `public/consent/`.

### Connecting live Stripe

1. Get keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` in `.env.local`
3. The payment step will immediately work with real Stripe

### Adjusting branding

Edit `config/branding.ts` for colors, logo, name, and URLs.
Edit `tailwind.config.ts` to modify the color palette.

## Security & HIPAA Considerations

- **No raw card data** is stored or transmitted by this application. Stripe Elements handles all PCI-sensitive data client-side.
- **Stripe SetupIntent** pattern saves a reusable payment method for future off-session charges (no-show policy).
- **Environment variables** protect all API credentials. Never commit `.env.local`.
- **OAuth tokens** are encrypted at rest locally (AES-256-GCM) and must be stored in a durable, access-controlled store in production.
- **`noindex, nofollow`** meta tag prevents search engine indexing of the intake form.
- **Server-side only** operations for Stripe customer creation and DrChrono API calls.
- All patient data is stored in DrChrono and Stripe — no local database to secure.

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.example` to Vercel project settings
4. Set up a durable token store (see "Vercel production" above) and implement the `TokenStore` adapter
5. Update `DRCHRONO_REDIRECT_URI` to your production URL
6. Deploy
7. Visit `/admin/drchrono` on your production domain to connect DrChrono

## No-Show Charge Architecture

The payment flow saves a card for future use:

1. **During intake**: `SetupIntent` saves the patient's payment method to a Stripe Customer
2. **On file**: `stripeCustomerId` and `stripePaymentMethodId` are stored in Stripe
3. **If no-show occurs**: Call `chargeNoShowFee()` from `lib/integrations/stripe/server.ts` with the stored IDs
4. **Optional**: Sync charge status back to DrChrono via `syncPaymentMetadata()`

The `chargeNoShowFee()` function is ready to use from any admin tool or scheduled job.
# HopeFirstIntake
# HopeFirstIntake
