import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Disclaimer | Roventis Sourcing",
  description: "Important disclaimers regarding the Roventis Sourcing platform and affiliate program.",
};

export default function DisclaimerPage() {
  return (
    <article className="legal-content">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0071e3]/[0.06] mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0071e3]">Legal</span>
        </div>
        <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-[-0.04em] text-[#1d1d1f] leading-[1.1]">
          Legal Disclaimer
        </h1>
        <p className="mt-4 text-[15px] text-[#6e6e73]">
          Last updated: 25 May 2026
        </p>
      </header>

      <section>
        <h2>1. No Earnings Guarantee</h2>
        <p>
          Roventis Sourcing does not guarantee any specific level of income, commissions, or deal volume.
          Earnings depend entirely on individual effort, market conditions, and buyer availability. Any
          figures presented on the Platform (including calculators, testimonials, or statistics) are for
          illustrative purposes only and do not constitute a promise of future earnings.
        </p>
      </section>

      <section>
        <h2>2. Not Financial or Legal Advice</h2>
        <p>
          Nothing on this Platform constitutes financial, tax, legal, or professional advice. You are
          responsible for consulting with qualified professionals regarding your tax obligations, business
          registration, and legal compliance. Roventis is not your employer, agent, or financial advisor.
        </p>
      </section>

      <section>
        <h2>3. Product and Supplier Disclaimer</h2>
        <p>
          Roventis acts as an intermediary connecting affiliates with buyers. We do not manufacture, stock,
          or directly supply any products. While we verify our supplier network, we cannot guarantee:
        </p>
        <ul>
          <li>Product quality, specifications, or fitness for any particular purpose</li>
          <li>Delivery timelines or availability</li>
          <li>Accuracy of supplier-provided pricing (prices may change without notice)</li>
          <li>That products will meet the buyer&apos;s specific requirements</li>
        </ul>
        <p>
          All product warranties, if any, are provided directly by the manufacturer or supplier.
        </p>
      </section>

      <section>
        <h2>4. Platform Availability</h2>
        <p>
          The Platform is provided &quot;as is&quot; and &quot;as available.&quot; We do not warrant that the Platform will be
          uninterrupted, error-free, or secure at all times. We may perform maintenance, updates, or
          modifications that temporarily affect availability. We are not liable for any loss resulting
          from platform downtime.
        </p>
      </section>

      <section>
        <h2>5. Third-Party Links and Services</h2>
        <p>
          The Platform may contain links to third-party websites or use third-party services (Clerk, Convex,
          Vercel). We are not responsible for the content, privacy practices, or availability of these
          third-party services. Your use of them is at your own risk and subject to their respective terms.
        </p>
      </section>

      <section>
        <h2>6. Tax Responsibility</h2>
        <p>
          Affiliates are independent contractors responsible for:
        </p>
        <ul>
          <li>Registering with SARS as a provisional taxpayer if required</li>
          <li>Declaring all commission income on tax returns</li>
          <li>Registering for VAT if turnover exceeds the threshold (currently R1 million per annum)</li>
          <li>Maintaining appropriate records for tax purposes</li>
        </ul>
        <p>
          Roventis does not withhold tax from commission payments and is not responsible for your tax compliance.
        </p>
      </section>

      <section>
        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Roventis (Pty) Ltd, its directors, employees,
          and agents shall not be liable for any direct, indirect, incidental, special, consequential, or
          punitive damages arising from your use of or inability to use the Platform. Our aggregate liability
          is limited to the commissions paid to you in the preceding 6 months.
        </p>
      </section>

      <section>
        <h2>8. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Roventis, its directors, employees, and agents from
          any claims, damages, or expenses arising from:
        </p>
        <ul>
          <li>Your breach of these terms or any agreement with Roventis</li>
          <li>Your interactions with buyers or third parties</li>
          <li>Any misrepresentation you make regarding products or services</li>
          <li>Your violation of any applicable law</li>
        </ul>
      </section>

      <section>
        <h2>9. Governing Law</h2>
        <p>
          This disclaimer and all legal documents on this Platform are governed by and construed in accordance
          with the laws of the Republic of South Africa, including POPIA, ECTA, and the CPA where applicable.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          For legal enquiries, contact us at <strong>legal@roventis.co.za</strong>.
        </p>
      </section>
    </article>
  );
}
