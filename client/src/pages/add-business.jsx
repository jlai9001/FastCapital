import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './add-business.css';
import { base_url } from '../api'
import businessPlaceholder from "../assets/business_placeholder.png";


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

  const [businessId, setBusinessId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch(`${base_url}/api/business/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            website_url: data.website_url || "",
            address1: data.address1 || "",
            address2: data.address2 || "",
            city: data.city || "",
            state: data.state || "",
            postal_code: data.postal_code || "",
          });
          setBusinessId(data.id); // used to determine PUT vs POST
        }
      } catch (err) {
        console.error("Failed to fetch business data:", err);
      }
    };

    fetchBusiness();
  }, []);

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

    if (businessId) {
      const payload = {
        ...formData,
        website_url: normalizeUrl(formData.website_url),
      };

      const res = await fetch(`${base_url}/api/business/${businessId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Business updated!");
        navigate("/business-profile");
      } else {
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map((err) => err.msg).join(", ");
          setMessage(messages);
        } else {
          setMessage(data.detail || "Failed to update business.");
        }
      }

    } else {
      // Create: send multipart/form-data including file upload
      // Create: send multipart/form-data including file upload
const form = new FormData();
for (const key in formData) {
  let value = formData[key];
  if (key === "website_url") value = normalizeUrl(value);
  form.append(key, value);
}

// ✅ Always include an image:
// - If user picked one => use it
// - Else => convert placeholder PNG into a File and use that
if (logoFile) {
  form.append("image", logoFile);
} else {
  const resp = await fetch(businessPlaceholder);
  const blob = await resp.blob();

  // Make it a File so backend receives UploadFile normally
  const placeholderFile = new File([blob], "business_placeholder.png", {
    type: blob.type || "image/png",
  });

  form.append("image", placeholderFile);
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
          setMessage(data.detail || "Failed to save business.");
        }
      }
    }
  };


  return (
    <div className="add-business-container">
      <div className = "business-form">
      <div className="add-business-title">
        {businessId ? "Edit Business" : "Add Business"}
      </div>
      <form onSubmit={handleSubmit}>
        <div className = "field-label">Name</div>
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
          <button
          className="cancel-button"
          type="button"
          onClick={() => navigate("/")}
          >
            Cancel
            </button>
          <button className="add-business-button" type="submit">
          {businessId ? "Update Business" : "Add Business"}
          </button>
          </div>
          {message && <p>{message}</p>}
        </form>
        </div>
      </div>
  );
}

export default AddBusiness;
