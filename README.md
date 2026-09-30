# Nigar Gems & Jewellers — Gold Savings Business System v3

Production-ready web app architecture using Supabase Auth + PostgreSQL + Row Level Security, with optional WhatsApp Cloud API sending through a Supabase Edge Function.

## Business details
- Nigar Gems & Jewellers
- Kafla Bazar, Cuttack, Odisha
- 7978786142
- nigarjewellers.in@gmail.com
- GSTIN: 21AGAFS5666G1Z0
- Schemes: Nigar Arambh, Nigar Unnati, Nigar Sikhar
- Durations: 7, 12, 24 months
- Instalments: ₹1,000; ₹2,000; ₹3,000; ₹5,000; ₹10,000; ₹20,000; ₹25,000; ₹30,000; ₹35,000; ₹50,000; ₹1,00,000; ₹2,00,000

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. In Supabase Authentication, create your first user. Then insert/update their profile role to `admin` using the SQL shown at the bottom of schema.sql.
4. Edit `config.js` with your Supabase project URL and publishable/anon key.
5. Deploy the folder to GitHub Pages, Netlify, Cloudflare Pages, etc.
6. Optional WhatsApp automation: deploy `supabase/functions/send-whatsapp` as an Edge Function and add its secrets. See `supabase/WHATSAPP_SETUP.md`.

## Security
- Browser uses only the publishable/anon key.
- Customer/payment tables have RLS policies.
- Staff/admin roles are stored in `profiles` and checked by database policies.
- Never expose a Supabase service_role key in the website.

## WhatsApp
The app can always open WhatsApp with a pre-filled payment message. For server-side automatic sending, configure Meta WhatsApp Cloud API and the Edge Function. Meta may require an approved message template outside the customer-service window.
