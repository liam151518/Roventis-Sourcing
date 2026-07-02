// Convex auth configuration.
//
// We authenticate users via Clerk. To make this work, the Clerk
// dashboard must have a JWT template named exactly "convex" that
// includes publicMetadata in its claims (the default Clerk Convex
// template does this).
//
// The `domain` here is the Clerk Frontend API URL. We use a
// production Clerk custom domain (clerk.roventissourcing.com), so
// the issuer is `https://clerk.roventissourcing.com`. The
// `clerk.` prefix IS required for production custom Clerk domains
// (e.g. clerk.yourcompany.com), unlike the default
// `<verb>-<noun>-NN.clerk.accounts.dev` dev hosts.
//
// You can verify the issuer by opening
//   https://<your-clerk-domain>/.well-known/jwks.json
// - if it loads with `{"keys":[...]}`, you're on the right domain.

export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "https://clerk.roventissourcing.com",
      applicationID: "convex",
    },
  ],
};