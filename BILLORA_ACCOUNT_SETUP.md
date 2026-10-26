# Billora customer accounts: owner activation steps

Billora now uses its own dedicated Supabase project (`gqzwtxiltlguqkactgmh`). Its public browser key is safe to expose; database row-level security protects private finance records. The DayRidge project is NOT used.

## Required Supabase redirect settings

Open: https://supabase.com/dashboard/project/gqzwtxiltlguqkactgmh/auth/url-configuration

Set Site URL:
`https://lukefaulkner180.github.io/billora/`

Under Redirect URLs add both:
`https://lukefaulkner180.github.io/billora/`
`https://lukefaulkner180.github.io/billora/?auth=reset`

This allows both confirmation emails and reset-password emails to return to Billora. The reset form sets a new password and then signs the user out to sign back in.

Check Supabase > Authentication > Providers > Email is enabled and that email confirmation is enabled for the public testing phase. Hosted Supabase email has small test limits. A custom SMTP provider and appropriate anti-abuse rate limits will be required for more users.

## Test the end-to-end journey with sample data only
1. Visit https://lukefaulkner180.github.io/billora/?auth=signup
2. Create an account using a test inbox and password.
3. Follow the email confirmation link; check that it returns to Billora, not localhost.
4. Add a fictional bill, wait for Saved status, sign out and sign in again.
5. Confirm the original account's fictional bill persists in that account only.
6. Try Forgot password, use the new password screen and sign in with the new password.
7. Repeat with a second email to confirm each account is isolated; inspect the actual RLS behaviour with two identities.
8. Test mobile browser and delivery time.

## Not yet public-production-ready
- Legal privacy notice, terms, GDPR rights and account deletion
- Two-account integration test and recovery link behaviour
- Reliable custom SMTP, rate limits, monitoring, backups and rollback
- Google and Microsoft OAuth
- Stripe intentionally remains the LAST integration

Use fictional figures during testing, not real private financial details.
