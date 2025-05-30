import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './add-business.css';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    if (logoFile) {
      form.append("image", logoFile);
    }
    form.append("user_id");

    const res = await fetch("http://localhost:8000/api/business", {
      method: "POST",
      body: form,
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setMessage("Business added!");
      navigate("/portfolio");
    } else {
      setMessage(data.detail || "Failed to add business.");
    }
  };

  return (
    <div className="add-business-container">
      <h1 className="add-business-title">Add Business</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Business Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="website_url"
            type="url"
            placeholder="Business Website"
            value={formData.website_url}
            onChange={handleChange}
            required
          />
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <input
          name="address1"
          type="address"
          placeholder="Address1"
          value={formData.address1}
          onChange={handleChange}
          required
        />
        <input
          name="address2"
          type="address"
          placeholder="Address2"
          value={formData.address2}
          onChange={handleChange}
          required
        />
        <input
          name="city"
          type="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <input
          name="state"
          type="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          required
        />

        <div className="button-group">
          <button type="button" onClick={() => navigate("/")}>Cancel</button>
          <button type="submit">
            Add Business
          </button>
          </div>

          {message && <p>{message}</p>}

        </form>
        </div>
  );
}

export default AddBusiness;
