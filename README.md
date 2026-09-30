# NIGAR Gems & Jewellers – Gold Savings App

This is a mobile-friendly PWA frontend for the NIGAR Gold Savings business system.

## Included modules
1. Customer profile
2. Nominee
3. ID proof
4. Address
5. Add payment
6. Customer passbook
7. Receipt / Print / PDF
8. WhatsApp
9. Ledger
10. Reports
11. Admin / Staff permissions

## Supabase setup
1. Copy `config.example.js` to `config.js`.
2. Put your Supabase project URL and publishable/anon key in `config.js`.
3. Do NOT use a `service_role` key in the browser.
4. Your existing SQL upgrade should be run in Supabase SQL Editor first.
5. Open `index.html` through GitHub Pages/Netlify/Cloudflare Pages (not by double-clicking if the browser blocks modules).
6. Create staff users in Supabase Authentication.

## Important
The frontend intentionally does not delete or overwrite existing customer/payment records. Before production, verify the exact column names and RLS policies in your existing database.