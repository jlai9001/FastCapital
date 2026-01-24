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
            <li>
              <strong>Name:</strong> Tyler McCallum
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:tyler.mccallum9@gmail.com">
                tyler.mccallum9@gmail.com
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/tylermccallum/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/tylermccallum/
              </a>
            </li>
          </ul>

          <ul className="contact-list contact2">
            <li>
              <strong>Name:</strong> Bowe Jessop
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:bowejessop@gmail.com">
                bowejessop@gmail.com
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/bowe-jessop/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/bowe-jessop
              </a>
            </li>
          </ul>

          <ul className="contact-list contact3">
            <li>
              <strong>Name:</strong> Daniel Greenberg
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:danielrgreenberg1@gmail.com">
                danielrgreenberg1@gmail.com
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/danielraphaelgreenberg/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/danielraphaelgreenberg/
              </a>
            </li>
          </ul>



          <ul className="contact-list contact4">
            <li>
              <strong>Name:</strong> Jonathan Lai
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:jlai9001@gmail.com">
                jlai9001@gmail.com
              </a>
            </li>
            <li>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/jonathan-lai-a8444974/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/jonathan-lai
              </a>
            </li>
          </ul>



        </section>
      </section>
    </main>
  );
}
