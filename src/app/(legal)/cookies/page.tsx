import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Roventis Sourcing",
  description: "How Roventis Sourcing uses cookies and similar technologies on our platform.",
};

export default function CookiesPage() {
  return (
    <article className="legal-content">
      <header>
        <h1 className="text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-[-0.04em] text-[#1d1d1f] leading-[1.1]">
          Cookie Policy
        </h1>
        <p className="mt-4 text-[15px] text-[#6e6e73]">
          Last updated: 25 May 2026
        </p>
      </header>

      <section>
        <h2>1. What Are Cookies</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the website
          remember your preferences, maintain your session, and understand how you interact with the platform.
          Similar technologies include local storage, session storage, and pixel tags.
        </p>
      </section>

      <section>
        <h2>2. How We Use Cookies</h2>

        <h3>2.1 Essential Cookies (Always Active)</h3>
        <p>These cookies are necessary for the Platform to function and cannot be disabled.</p>
        <div className="cookie-table">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Clerk</td>
                <td>Authentication session management</td>
                <td>Session / 7 days</td>
              </tr>
              <tr>
                <td>Convex</td>
                <td>Real-time database connection</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>Roventis</td>
                <td>Cookie consent preference</td>
                <td>12 months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>2.2 Functional Cookies</h3>
        <p>These enhance your experience by remembering your preferences.</p>
        <div className="cookie-table">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Roventis</td>
                <td>Theme preference, calculator state</td>
                <td>12 months</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Performance monitoring</td>
                <td>Session</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>2.3 Analytics Cookies (Require Consent)</h3>
        <p>These help us understand how visitors interact with the Platform.</p>
        <div className="cookie-table">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vercel Analytics</td>
                <td>Page views, performance metrics</td>
                <td>24 months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>3. Managing Your Preferences</h2>
        <p>
          When you first visit our Platform, a cookie banner will ask for your consent to non-essential cookies.
          You can change your preferences at any time by:
        </p>
        <ul>
          <li>Clicking the cookie settings link in our footer</li>
          <li>Clearing cookies in your browser settings</li>
          <li>Using browser extensions that manage cookie consent</li>
        </ul>
        <p>
          Blocking essential cookies may prevent parts of the Platform from functioning correctly (e.g., you may
          not be able to stay logged in).
        </p>
      </section>

      <section>
        <h2>4. Third-Party Cookies</h2>
        <p>
          Our third-party service providers may set their own cookies. We do not control these cookies.
          Please refer to their respective privacy policies:
        </p>
        <ul>
          <li><strong>Clerk:</strong> clerk.com/legal/privacy</li>
          <li><strong>Convex:</strong> convex.dev/legal/privacy</li>
          <li><strong>Vercel:</strong> vercel.com/legal/privacy-policy</li>
        </ul>
      </section>

      <section>
        <h2>5. Data Transfers</h2>
        <p>
          Cookie data may be transferred to servers outside South Africa (primarily the United States and Europe)
          by our third-party providers. These transfers are governed by appropriate data protection safeguards
          as described in our Privacy Policy.
        </p>
      </section>

      <section>
        <h2>6. Updates</h2>
        <p>
          We may update this Cookie Policy as our use of cookies evolves. Changes will be reflected on this
          page with an updated revision date.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          For questions about our use of cookies, contact us at <strong>privacy@roventis.co.za</strong>.
        </p>
      </section>
    </article>
  );
}
