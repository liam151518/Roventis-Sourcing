import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Roventis Sourcing",
  description: "How Roventis Sourcing collects, uses, and protects your personal information under POPIA.",
};

export default function PrivacyPage() {
  return (
    <article className="legal-content">
      <header className="mb-12">
        <p className="text-[12px] font-medium uppercase tracking-widest text-[#0071e3] mb-3">Legal</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.035em] text-[#1d1d1f] leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[15px] text-[#6e6e73]">Last updated: 25 May 2026</p>
      </header>

      <section>
        <h2>1. Introduction</h2>
        <p>
          Roventis Sourcing (Pty) Ltd (&quot;Roventis&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting
          your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (&quot;POPIA&quot;)
          and the Electronic Communications and Transactions Act 25 of 2002 (&quot;ECTA&quot;).
        </p>
        <p>
          This Privacy Policy explains how we collect, use, store, and share your personal information when you use
          our platform at roventis.co.za (the &quot;Platform&quot;).
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <h3>2.1 Information you provide</h3>
        <ul>
          <li>Full name, email address, phone number, and city</li>
          <li>LinkedIn profile URL and experience level</li>
          <li>Bank account details (for commission payouts)</li>
          <li>Company and client information submitted through deals and orders</li>
          <li>Support ticket content and communications</li>
        </ul>

        <h3>2.2 Information collected automatically</h3>
        <ul>
          <li>Device information (browser type, operating system)</li>
          <li>IP address and approximate location</li>
          <li>Usage data (pages visited, features used, session duration)</li>
          <li>Authentication tokens and session identifiers (via Clerk)</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>We process your personal information for the following lawful purposes:</p>
        <ul>
          <li><strong>Contract performance:</strong> Managing your affiliate account, processing commissions, and facilitating payouts</li>
          <li><strong>Legitimate interest:</strong> Improving our platform, preventing fraud, and providing support</li>
          <li><strong>Legal obligation:</strong> Complying with tax reporting and regulatory requirements</li>
          <li><strong>Consent:</strong> Sending marketing communications (where you have opted in)</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Sharing</h2>
        <p>We may share your personal information with:</p>
        <ul>
          <li><strong>Service providers:</strong> Clerk (authentication), Convex (database hosting), Vercel (platform hosting)</li>
          <li><strong>Buyers:</strong> Limited contact information when you submit orders on their behalf</li>
          <li><strong>Regulatory authorities:</strong> When required by South African law</li>
        </ul>
        <p>
          We do not sell your personal information to third parties. Our service providers are bound by data processing
          agreements that require them to protect your information.
        </p>
      </section>

      <section>
        <h2>5. Cross-Border Transfers</h2>
        <p>
          Some of our service providers (Clerk, Convex, Vercel) store data outside of South Africa. These transfers
          are protected by appropriate safeguards including the provider&apos;s compliance with equivalent data protection
          frameworks (GDPR, SOC 2 certifications).
        </p>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active, plus:</p>
        <ul>
          <li>Financial records: 5 years (as required by the Tax Administration Act)</li>
          <li>Commission/payout records: 5 years from date of last transaction</li>
          <li>Support communications: 2 years from resolution</li>
          <li>Account data: 30 days after account deletion request</li>
        </ul>
      </section>

      <section>
        <h2>7. Your Rights Under POPIA</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information (subject to legal retention requirements)</li>
          <li>Object to processing for direct marketing purposes</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Lodge a complaint with the Information Regulator</li>
        </ul>
        <p>
          To exercise these rights, contact our Information Officer at <strong>privacy@roventis.co.za</strong>.
          We will respond within 30 days.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We implement appropriate technical and organisational measures to protect your personal information,
          including encryption in transit (TLS), access controls, and regular security reviews. In the event
          of a data breach that poses a risk to your rights, we will notify you and the Information Regulator
          as required by POPIA.
        </p>
      </section>

      <section>
        <h2>9. Information Regulator</h2>
        <p>If you are unsatisfied with our response to a privacy concern, you may contact:</p>
        <p>
          <strong>The Information Regulator (South Africa)</strong><br />
          Email: inforeg@justice.gov.za<br />
          Website: www.justice.gov.za/inforeg
        </p>
      </section>

      <section>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be communicated via email
          or a prominent notice on the Platform. Continued use of the Platform after changes constitutes
          acceptance of the updated policy.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          <strong>Roventis Sourcing (Pty) Ltd</strong><br />
          Information Officer: privacy@roventis.co.za<br />
          General enquiries: support@roventis.co.za
        </p>
      </section>
    </article>
  );
}
