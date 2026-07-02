// Convex auth configuration.
//
// We authenticate users via Clerk. To make this work, the Clerk
// dashboard must have a JWT template named exactly "convex" that
// includes publicMetadata in its claims (the default Clerk Convex
// template does this).
//
// The `domain` here is the Clerk Frontend API URL (the same value
// shown on the Clerk dashboard API keys page). For development
// Clerk projects it's `https://<verb>-<noun>-<NN>.<clerk.accounts.dev|clerk.com>`.
// For our Clerk project the publishable key is
// pk_test_c3VwcmVtZS1mZXJyZXQtOTMuY2xlcmsuYWNjb3VudHMuZGV2JA
// which decodes to host `supreme-ferret-93.clerk.accounts.dev`,
// so the Frontend API URL is
// https://supreme-ferret-93.clerk.accounts.dev
// (NO `clerk.` prefix - that prefix is only used for Clerk's
// production custom domains, not the default accounts.dev hosts).

export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "https://supreme-ferret-93.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};