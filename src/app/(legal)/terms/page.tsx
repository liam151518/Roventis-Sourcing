import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Roventis Sourcing",
  description: "The terms and conditions governing your use of the Roventis Sourcing platform.",
};

export default function TermsPage() {
  return (
    <article className="legal-content">
      <header>
        <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-[-0.04em] text-[#1d1d1f] leading-[1.1]">
          Terms of Service
        </h1>
        <p className="mt-4 text-[15px] text-[#6e6e73]">
          Last updated: 25 May 2026
        </p>
      </header>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Roventis Sourcing platform (&quot;Platform&quot;), you agree to be bound by these Terms
          of Service (&quot;Terms&quot;). If you do not agree, you must not use the Platform. These Terms constitute a
          legally binding agreement between you and Roventis (Pty) Ltd (&quot;Roventis&quot;), registered in
          South Africa.
        </p>
      </section>

      <section>
        <h2>2. Platform Description</h2>
        <p>
          Roventis Sourcing is a B2B affiliate marketing platform that connects independent sales agents
          (&quot;Affiliates&quot;) with verified product buyers across hospitality, corporate, and retail sectors in
          South Africa. The Platform facilitates lead distribution, deal management, commission tracking,
          and payout processing.
        </p>
      </section>

      <section>
        <h2>3. Eligibility</h2>
        <ul>
          <li>You must be at least 18 years old</li>
          <li>You must be a South African resident or have legal authority to conduct business in South Africa</li>
          <li>You must provide accurate and complete registration information</li>
          <li>You must not have been previously suspended or removed from the Platform</li>
        </ul>
      </section>

      <section>
        <h2>4. Account Responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your login credentials</li>
          <li>All activity that occurs under your account</li>
          <li>Notifying us immediately of any unauthorised use</li>
          <li>Keeping your profile and banking information up to date</li>
        </ul>
        <p>Roventis is not liable for losses resulting from unauthorised access to your account.</p>
      </section>

      <section>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Provide false or misleading information to buyers or Roventis</li>
          <li>Circumvent the Platform to deal directly with buyers or suppliers</li>
          <li>Use automated systems (bots, scrapers) to access the Platform</li>
          <li>Interfere with the security or proper functioning of the Platform</li>
          <li>Violate any applicable law, including the Consumer Protection Act or POPIA</li>
          <li>Misrepresent your relationship with Roventis (you are an independent contractor, not an employee)</li>
        </ul>
      </section>

      <section>
        <h2>6. Commissions and Payments</h2>
        <ul>
          <li>Commission rates are determined by your affiliate tier (Bronze 5%, Silver 7%, Gold 9%, Platinum 12%)</li>
          <li>Commissions are earned only after admin approval of a submitted order</li>
          <li>Payouts are processed within 5 business days of approval</li>
          <li>You are responsible for declaring commission income to SARS and paying applicable taxes</li>
          <li>Roventis reserves the right to withhold or claw back commissions in cases of fraud, order cancellation, or buyer refund within 90 days</li>
        </ul>
      </section>

      <section>
        <h2>7. Independent Contractor Status</h2>
        <p>
          Affiliates are independent contractors and not employees, partners, or agents of Roventis. You are
          responsible for your own tax obligations (including income tax and VAT registration if applicable),
          insurance, and compliance with applicable laws. Nothing in these Terms creates an employment
          relationship.
        </p>
      </section>

      <section>
        <h2>8. Intellectual Property</h2>
        <p>
          All content, branding, software, and materials on the Platform are owned by or licensed to Roventis.
          You may not copy, modify, distribute, or create derivative works without our prior written consent.
          Marketing materials provided to you are licensed for use solely in connection with your affiliate activities.
        </p>
      </section>

      <section>
        <h2>9. Limitation of Liability</h2>
        <ul>
          <li>The Platform is provided &quot;as is&quot; without warranties of any kind</li>
          <li>Roventis does not guarantee any level of earnings or deal volume</li>
          <li>Our total liability to you is limited to the commissions paid to you in the preceding 6 months</li>
          <li>We are not liable for indirect, incidental, or consequential damages</li>
          <li>We are not liable for actions taken by buyers, suppliers, or other affiliates</li>
        </ul>
      </section>

      <section>
        <h2>10. Termination</h2>
        <p>
          Either party may terminate this agreement with 14 days written notice. Roventis may suspend or
          terminate your account immediately for breach of these Terms, fraudulent activity, or legal
          compliance reasons. Upon termination:
        </p>
        <ul>
          <li>Approved commissions for completed orders will still be paid</li>
          <li>Pending deals and unclaimed leads revert to the available pool</li>
          <li>Your access to the Platform will be revoked</li>
          <li>The non-circumvention clause survives for 12 months</li>
        </ul>
      </section>

      <section>
        <h2>11. Dispute Resolution</h2>
        <p>
          Disputes will be resolved as follows:
        </p>
        <ol>
          <li><strong>Negotiation:</strong> Good faith discussion within 14 days of written notice</li>
          <li><strong>Mediation:</strong> If unresolved, mediation under AFSA (Arbitration Foundation of Southern Africa) rules</li>
          <li><strong>Arbitration:</strong> Binding arbitration in Johannesburg under AFSA rules if mediation fails</li>
        </ol>
        <p>These Terms are governed by the laws of the Republic of South Africa.</p>
      </section>

      <section>
        <h2>12. Force Majeure</h2>
        <p>
          Roventis is not liable for failure to perform obligations due to events beyond our reasonable control,
          including natural disasters, power outages, internet disruptions, government actions, or pandemics.
        </p>
      </section>

      <section>
        <h2>13. Changes to Terms</h2>
        <p>
          We may modify these Terms by providing 14 days notice via email or platform notification. Continued
          use after the notice period constitutes acceptance. Material changes to commission structure will
          require 30 days notice.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          <strong>Roventis (Pty) Ltd</strong><br />
          Legal enquiries: legal@roventis.co.za<br />
          Support: support@roventis.co.za
        </p>
      </section>
    </article>
  );
}
