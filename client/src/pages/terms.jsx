
import "./terms.css";

export default function Terms() {
  return (
    <main className="terms-page">
      <section className="terms-card">
        <hr className="terms-divider" />

        <section className="terms-section">

          <h1 className="terms-title">Terms & Conditions</h1>
          <p className="terms-subtitle">
            For our online investment platform (aka: “the place where money dreams big and sometimes naps”)
          </p>
            <br/>

          <h2>1) The Very Serious Introduction (but not too serious)</h2>
          <p>
            Welcome! By using this platform, you agree to these Terms & Conditions (“Terms”). If you don’t agree,
            please close this tab, take a deep breath, and go do something relaxing—like watching a cat attempt to
            jump onto a couch and fail magnificently.
          </p>
          <p>
            These Terms explain how the platform works, what you can expect from us, what we expect from you, and
            what happens if your account tries to do a backflip off the rules.
          </p>
        </section>

        <section className="terms-section">
          <h2>2) Definitions (aka: “What do these words mean?”)</h2>
          <ul>
            <li><strong>“Platform”</strong>: This website/app and everything inside it that tries to be helpful.</li>
            <li><strong>“You”</strong>: A human (or an extremely polite robot) using the Platform.</li>
            <li><strong>“We/Us”</strong>: The Platform team, fueled by coffee and “why is prod broken” energy.</li>
            <li><strong>“Investments”</strong>: Financial opportunities that may go up, down, sideways, or do interpretive dance.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3) Eligibility</h2>
          <p>
            You must be legally allowed to use this Platform in your jurisdiction. If you’re not sure, please ask a
            qualified professional and not your cousin who “reads a lot of Reddit.”
          </p>
        </section>

        <section className="terms-section">
          <h2>4) Not Financial Advice</h2>
          <p>
            Nothing on this Platform is financial, legal, or tax advice. We provide tools and information; you make
            decisions. If you click “Buy” because a graph looked confident, that’s on you.
          </p>

        </section>

        <section className="terms-section">
          <h2>5) Risk Disclosure</h2>
          <p>
            Investments can lose value. Past performance does not guarantee future results. Only invest what you can
            afford to lose without needing to sell your couch, dignity, or prized collectibles.
          </p>
        </section>

        <section className="terms-section">
          <h2>6) Accounts & Security</h2>
          <p>
            You are responsible for keeping your credentials secure. If your password is
            <code> password123</code>, please change it immediately. We will sigh.
          </p>
        </section>

        <section className="terms-section">
          <h2>7) Acceptable Use</h2>
          <ul>
            <li>Don’t break the law.</li>
            <li>Don’t hack, scrape, reverse engineer, or summon demons via the API.</li>
            <li>Don’t upload malware or cursed spreadsheets.</li>
            <li>Don’t impersonate others (including “TotallyRealCEO123”).</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>8) Platform Availability</h2>
          <p>
            We aim for uptime, not immortality. Downtime may occur due to maintenance, internet gremlins, or cosmic
            indifference.
          </p>
        </section>

        <section className="terms-section">
          <h2>9) Fees</h2>
          <p>
            Any applicable fees will be clearly disclosed before transactions. Surprise fees are the villain of
            modern finance.
          </p>
        </section>

        <section className="terms-section">
          <h2>10) Intellectual Property</h2>
          <p>
            All content, branding, and design belong to us or our licensors. Please don’t repackage it as
            “DefinitelyNotThisPlatform™.”
          </p>
        </section>

        <section className="terms-section">
          <h2>11) Privacy</h2>
          <p>
            We collect only what’s necessary to operate the Platform. We protect it, and we do not sell your secrets
            for sandwiches.
          </p>
        </section>

        <section className="terms-section">
          <h2>12) Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these Terms or attempt spectacularly bad ideas.
            You may leave at any time—no dramatic monologue required.
          </p>
        </section>

        <section className="terms-section">
          <h2>13) Limitation of Liability</h2>
          <p>
            To the extent allowed by law, we are not liable for indirect damages, lost profits, or emotional distress
            caused by market volatility.
          </p>
        </section>

        <section className="terms-section">
          <h2>14) Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use means acceptance of updates.
          </p>
        </section>

        <section className="terms-section">
          <h2>15) Contact</h2>
          <p>
            Questions, concerns, or typo-spotting superpowers? Please contact support through the Platform.
          </p>
        </section>

        <footer className="terms-footer">
          <p>
            <strong>Friendly reminder:</strong> Investing involves risk. Read carefully, invest thoughtfully, and may
            your portfolio be ever in your favor.
          </p>
        </footer>
      </section>
    </main>
  );
}
