import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Agreement | Roventis Sourcing",
  description: "The binding agreement between Roventis Sourcing and its affiliate partners.",
};

export default function AffiliateAgreementPage() {
  return (
    <article className="legal-content">
      <header>
        <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-[-0.04em] text-[#1d1d1f] leading-[1.1]">
          Affiliate Agreement
        </h1>
        <p className="mt-4 text-[15px] text-[#6e6e73]">
          Last updated: 25 May 2026
        </p>
      </header>

      <section>
        <h2>1. Parties</h2>
        <p>
          This Affiliate Agreement (&quot;Agreement&quot;) is entered into between Roventis (Pty) Ltd
          (&quot;Roventis&quot; or &quot;the Company&quot;) and you, the individual registering as an affiliate
          (&quot;Affiliate&quot; or &quot;you&quot;). By creating an account on the Platform, you accept and agree
          to be bound by this Agreement.
        </p>
      </section>

      <section>
        <h2>2. Appointment</h2>
        <p>
          Roventis appoints you as a non-exclusive, independent affiliate to introduce buyers to Roventis&apos;s
          product sourcing services. This appointment does not create an exclusive territory or guarantee any
          minimum deal volume or income.
        </p>
      </section>

      <section>
        <h2>3. Affiliate Obligations</h2>
        <p>As an Affiliate, you agree to:</p>
        <ul>
          <li>Act honestly, ethically, and in good faith in all dealings</li>
          <li>Not misrepresent products, pricing, or delivery timelines to buyers</li>
          <li>Submit accurate deal and order information through the Platform</li>
          <li>Complete all required training modules before engaging buyers</li>
          <li>Maintain confidentiality of proprietary pricing, supplier details, and buyer information</li>
          <li>Not engage in any activity that could harm Roventis&apos;s reputation</li>
          <li>Comply with all applicable laws including CPA and POPIA</li>
        </ul>
      </section>

      <section>
        <h2>4. Commission Structure</h2>
        <h3>4.1 Tier-Based Rates</h3>
        <div className="cookie-table">
          <table>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Rate</th>
                <th>Requirements</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bronze</td>
                <td>5%</td>
                <td>Entry level (default)</td>
              </tr>
              <tr>
                <td>Silver</td>
                <td>7%</td>
                <td>3+ closed deals</td>
              </tr>
              <tr>
                <td>Gold</td>
                <td>9%</td>
                <td>10+ closed deals, R500K+ total</td>
              </tr>
              <tr>
                <td>Platinum</td>
                <td>12%</td>
                <td>25+ closed deals, R2M+ total</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>4.2 When Commission Is Earned</h3>
        <p>Commission is only credited to your account when:</p>
        <ol>
          <li>A deal is moved to &quot;Closed Won&quot; status</li>
          <li>You submit a formal order through the Platform</li>
          <li>Roventis admin reviews and approves the order commission</li>
        </ol>
        <p>No commission is earned on deals that do not result in an approved order.</p>

        <h3>4.3 Payment Terms</h3>
        <ul>
          <li>Payouts are processed within 5 business days of payout request approval</li>
          <li>Payments are made via EFT to the bank account on your profile</li>
          <li>Minimum payout amount: R500</li>
          <li>You are responsible for all taxes on commission income</li>
        </ul>
      </section>

      <section>
        <h2>5. Commission Clawback</h2>
        <p>
          Roventis reserves the right to claw back (reverse) commissions within 90 days of payment if:
        </p>
        <ul>
          <li>The buyer cancels or returns the order</li>
          <li>The buyer defaults on payment to Roventis</li>
          <li>The deal was obtained through fraudulent or misleading representations</li>
          <li>A material error was made in commission calculation</li>
        </ul>
        <p>
          Clawed-back amounts will be deducted from your pending commission balance. If insufficient balance
          exists, the amount becomes a debt owed to Roventis.
        </p>
      </section>

      <section>
        <h2>6. Non-Circumvention</h2>
        <p>
          For a period of 12 months after your last interaction with a buyer introduced through the Platform,
          you agree not to:
        </p>
        <ul>
          <li>Deal directly with that buyer for products or services similar to those offered by Roventis</li>
          <li>Introduce that buyer to a competing supplier or platform</li>
          <li>Use confidential pricing or supplier information obtained through the Platform for personal gain</li>
        </ul>
        <p>
          Breach of this clause entitles Roventis to claim damages equal to the commissions that would have
          been earned on the circumvented deals plus reasonable legal costs.
        </p>
      </section>

      <section>
        <h2>7. Confidentiality</h2>
        <p>You acknowledge that the following constitute confidential information:</p>
        <ul>
          <li>Supplier identities, pricing, and terms</li>
          <li>Buyer lists and contact details</li>
          <li>Commission structures and internal processes</li>
          <li>Platform proprietary technology and business methods</li>
        </ul>
        <p>This confidentiality obligation survives termination of this Agreement indefinitely.</p>
      </section>

      <section>
        <h2>8. Leads and Deal Allocation</h2>
        <ul>
          <li>Leads are provided on a first-come, first-served basis</li>
          <li>Weekly claim limits apply based on your tier and performance</li>
          <li>Unclaimed or expired leads revert to the available pool</li>
          <li>Roventis may reassign leads if no progress is made within 30 days</li>
        </ul>
      </section>

      <section>
        <h2>9. Termination</h2>
        <p>
          Either party may terminate this Agreement with 14 days written notice via email. Roventis may
          terminate immediately for cause (breach of terms, fraud, inactivity exceeding 90 days). Upon
          termination:
        </p>
        <ul>
          <li>Approved commissions for completed orders will be paid out</li>
          <li>Pending/unapproved commissions are forfeited</li>
          <li>All confidentiality and non-circumvention obligations survive</li>
          <li>Access to the Platform is revoked</li>
        </ul>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          Roventis&apos;s total aggregate liability under this Agreement is limited to the total commissions
          paid to you in the 6 months preceding the claim. Roventis is not liable for loss of income,
          anticipated earnings, or indirect damages of any kind.
        </p>
      </section>

      <section>
        <h2>11. Dispute Resolution</h2>
        <p>
          Disputes will be resolved through negotiation (14 days), then mediation, then binding arbitration
          under AFSA rules in Johannesburg. This Agreement is governed by the laws of the Republic of
          South Africa.
        </p>
      </section>

      <section>
        <h2>12. Amendments</h2>
        <p>
          Roventis may amend this Agreement with 30 days notice. Continued use of the Platform after the
          notice period constitutes acceptance. Material changes to commission rates require separate
          written notice.
        </p>
      </section>

      <section>
        <h2>13. Entire Agreement</h2>
        <p>
          This Agreement, together with the Terms of Service and Privacy Policy, constitutes the entire
          agreement between you and Roventis regarding your affiliate activities. No verbal representations
          override these written terms.
        </p>
      </section>
    </article>
  );
}
