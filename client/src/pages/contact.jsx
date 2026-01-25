import "./contact.css";

export default function Contact() {
  return (
    <main className="contact-page">
      <section className="contact-card">
        <h1 className="contact-title">Contact</h1>
        <p className="contact-subtitle">
          Questions, feedback, or collaboration ideas? Reach out anytime.
        </p>
        <hr className="contact-divider" />

        <section className="contact-section">
          <ul className="contact-list contact1">
            <li className="contact-row">
              <strong>Name:</strong>
              <span className="contact-value">Tyler McCallum</span>
            </li>
            <li className="contact-row">
              <strong>Email:</strong>
              <span className="contact-value">
                <a href="mailto:tyler.mccallum9@gmail.com">
                  tyler.mccallum9@gmail.com
                </a>
              </span>
            </li>
            <li className="contact-row">
              <strong>LinkedIn:</strong>
              <span className="contact-value">
                <a
                  href="https://www.linkedin.com/in/tylermccallum/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/tylermccallum/
                </a>
              </span>
            </li>
          </ul>

          <ul className="contact-list contact2">
            <li className="contact-row">
              <strong>Name:</strong>
              <span className="contact-value">Bowe Jessop</span>
            </li>
            <li className="contact-row">
              <strong>Email:</strong>
              <span className="contact-value">
                <a href="mailto:bowejessop@gmail.com">bowejessop@gmail.com</a>
              </span>
            </li>
            <li className="contact-row">
              <strong>LinkedIn:</strong>
              <span className="contact-value">
                <a
                  href="https://www.linkedin.com/in/bowe-jessop/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/bowe-jessop
                </a>
              </span>
            </li>
          </ul>

          <ul className="contact-list contact3">
            <li className="contact-row">
              <strong>Name:</strong>
              <span className="contact-value">Daniel Greenberg</span>
            </li>
            <li className="contact-row">
              <strong>Email:</strong>
              <span className="contact-value">
                <a href="mailto:danielrgreenberg1@gmail.com">
                  danielrgreenberg1@gmail.com
                </a>
              </span>
            </li>
            <li className="contact-row">
              <strong>LinkedIn:</strong>
              <span className="contact-value">
                <a
                  href="https://www.linkedin.com/in/danielraphaelgreenberg/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/danielraphaelgreenberg/
                </a>
              </span>
            </li>
          </ul>

          <ul className="contact-list contact4">
            <li className="contact-row">
              <strong>Name:</strong>
              <span className="contact-value">Jonathan Lai</span>
            </li>
            <li className="contact-row">
              <strong>Email:</strong>
              <span className="contact-value">
                <a href="mailto:jlai9001@gmail.com">jlai9001@gmail.com</a>
              </span>
            </li>
            <li className="contact-row">
              <strong>LinkedIn:</strong>
              <span className="contact-value">
                <a
                  href="https://www.linkedin.com/in/jonathan-lai-a8444974/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/in/jonathan-lai
                </a>
              </span>
            </li>
          </ul>
        </section>
      </section>
    </main>
  );
}
