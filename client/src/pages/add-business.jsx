import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './add-business.css';
import { base_url } from '../api'

function AddBusiness() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        website_url: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        postal_code: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
      return "https://" + url;
    }
    return url;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    for (const key in formData) {
      let value = formData[key];

      if (key === "website_url") {
        value = normalizeUrl(value);
      }

      form.append(key, value);
    }

    if (logoFile) {
      form.append("image", logoFile);
    }

    const res = await fetch(`${base_url}/api/business`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Business added!");
      navigate("/portfolio");
    } else {
      if (Array.isArray(data.detail)) {
        const messages = data.detail.map((err) => err.msg).join(", ");
        setMessage(messages);
      } else {
        setMessage(data.detail || "Failed to add business.");
      }
    }
  };

  return (
    <div className="add-business-container">
      <div className = "business-form">
      <div className="add-business-title">Add Business</div>
      <div className = "field-label">Name</div>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Business Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        <div className = "field-label">Website</div>
          <input
            name="website_url"
            type="text"
            placeholder="https://www.business.com"
            value={formData.website_url}
            onChange={handleChange}
            required
          />
        <div className = "field-label">Picture</div>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        <div className = "field-label">Address</div>
          <input
          name="address1"
          type="text"
          placeholder="Address1"
          value={formData.address1}
          onChange={handleChange}
          required
        />
        <input
          name="address2"
          type="text"
          placeholder="Address2"
          value={formData.address2}
          onChange={handleChange}
        />
         <div className = "field-label">City</div>
        <input
          name="city"
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <div className = "field-label">State</div>
        <input
          name="state"
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <div className = "field-label">Postal Code</div>
        <input
          name="postal_code"
          type="text"
          placeholder="Postal Code"
          value={formData.postal_code}
          onChange={handleChange}
          required
        />
        <div className="button-group">
          <button className="cancel-button"  type="button" onClick={() => navigate("/")}>Cancel</button>
          <button className="add-business-button" type="submit">
            Add Business
          </button>
          </div>

          {message && <p>{message}</p>}

        </form>
        </div>
      </div>
  );
}

export default AddBusiness;
