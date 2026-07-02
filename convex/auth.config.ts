// Convex auth configuration.
//
// We authenticate users via Clerk. To make this work, the Clerk
// dashboard must have a JWT template named exactly "convex" that
// includes publicMetadata in its claims (the default Clerk Convex
// template does this).
//
// The `domain` here is the issuer from the Clerk JWT - it's
// `clerk.<your-clerk-frontend-api-host>` minus the protocol.
//
// Example: if your Clerk publishable key starts with
// pk_test_c3VwcmVtZS1mZXJyZXQtOTMuY2xlcmsuYWNjb3VudHMuZGV2JA
// the decoded host is `supreme-ferret-93.clerk.accounts.dev`,
// so the issuer domain is `clerk.supreme-ferret-93.clerk.accounts.dev`.

export default {
  providers: [
    {
      // Issuer domain from the Clerk JWT. Must match the Clerk
      // project's frontend API host prefixed with `clerk.`.
      // For our Clerk project (pk_test_c3VwcmVtZS1mZXJyZXQtOTMu
      // Y2xlcmsuYWNjb3VudHMuZGV2JA) the decoded host is
      // `supreme-ferret-93.clerk.accounts.dev`, so the issuer is
      // `clerk.supreme-ferret-93.clerk.accounts.dev`.
      //
      // For prod, override via the CLERK_JWT_ISSUER_DOMAIN env var
      // (Convex env, not Next.js env).
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "clerk.supreme-ferret-93.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};