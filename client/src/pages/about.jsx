import "./about.css";

export default function About() {
  return (
    <main className="about-page">
      <section className="about-card">


          <h1 className="about-title">About Fast Capital</h1>
          <p className="about-subtitle">
            Invest in local businesses. Empower communities. Grow your wealth. <br></br>
            Source Code: <a href="https://github.com/jlai9001/FastCapital">Github Repository</a>
          </p>

        <hr className="about-divider" />

        <section className="about-section">
          <h2>Our Goal</h2>
          <p>
            Fast Capital was created to make investing in early-stage and local businesses
            more accessible, transparent, and community-focused. Traditional investment
            platforms often prioritize large institutions—Fast Capital flips that model by
            empowering everyday investors to directly support businesses they believe in.
          </p>
          <p>
            The platform connects investors and business owners in a shared ecosystem where
            capital fuels growth, innovation, and local impact.
          </p>
        </section>

        <section className="about-section">
          <h2>User Stories That Drive the Platform</h2>
          <p>
            The core features of Fast Capital are guided by real-world user needs.
            Our MVP focuses on delivering the following experiences:
          </p>
          <ul className="about-list">
            <li>
              <strong>Investors</strong> can browse available investment opportunities,
              inspect detailed offerings, purchase shares, and track their personal portfolio.
            </li>
            <li>
              <strong>New users</strong> can create accounts securely and return confidently
              to manage their investments.
            </li>
            <li>
              <strong>Business owners</strong> can create business profiles and raise capital
              by offering structured investment opportunities.
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Core Features</h2>
          <ul className="about-list">
            <li>View and explore active investment opportunities</li>
            <li>Inspect detailed investment data</li>
            <li>Simulate investment purchases</li>
            <li>Maintain a user-specific investment portfolio</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Technology & Architecture</h2>
          <p>
            Fast Capital is built with modern, production-grade technologies designed
            for performance, scalability, and maintainability.
          </p>
          <ul className="about-list">
            <li>
              <strong>Backend:</strong> FastAPI with async support, powered by PostgreSQL
              and SQLAlchemy 2.x
            </li>
            <li>
              <strong>Frontend:</strong> React with a component-driven architecture
            </li>
            <li>
              <strong>Authentication:</strong> Secure password hashing and session handling
            </li>
            <li>
              <strong>Developer Experience:</strong> Docker, automated docs, testing,
              and a structured Git workflow
            </li>
          </ul>

        </section>

        <section className="about-section">
          <h2 className="about-list">Authors</h2>
          <ul>
            <li>Tyler McCallum</li>
            <li>Bowe Jessop</li>
            <li>Daniel Greenberg</li>
            <li>Jonathan Lai</li>
          </ul>
        </section>

        <footer className="about-footer">
          <p>
            Fast Capital is a collaborative project built with the belief that investing
            should strengthen communities—not just portfolios.
          </p>
        </footer>

      </section>
    </main>
  );
}
