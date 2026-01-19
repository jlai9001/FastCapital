import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./add-business.css";
import { base_url } from "../api";

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

  // ----------------------------------
  // Fetch existing business (edit mode)
  // ----------------------------------
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
          setBusinessId(data.id);
        }
      } catch (err) {
        console.error("Failed to fetch business:", err);
      }
    };

    fetchBusiness();
  }, []);

  // ----------------------------------
  // Handlers
  // ----------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const normalizeUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return "https://" + url;
    }
    return url;
  };

  // ----------------------------------
  // Submit
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ================================
    // UPDATE EXISTING BUSINESS
    // ================================
    if (businessId) {
      const payload = {
        ...formData,
        website_url: normalizeUrl(formData.website_url),
      };

      // 1) Update business details
      const res = await fetch(`${base_url}/api/business/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 2) Stop if failed
      if (!res.ok) {
        setMessage(data.detail || "Failed to update business.");
        return;
      }

      // 3) Upload image AFTER business update succeeds
      if (logoFile) {
        const imageForm = new FormData();
        imageForm.append("image", logoFile);

        const imageRes = await fetch(`${base_url}/api/business/${businessId}/image`, {
          method: "PATCH",
          credentials: "include",
          body: imageForm,
        });

        // 4) Stop if image upload failed
        if (!imageRes.ok) {
          setMessage("Business updated, but image upload failed.");
          return;
        }
      }

      // 5) Navigate ONCE, at the end, with a cache-buster
      const buster = Date.now();
      navigate("/business-profile", { state: { imageBuster: buster } });

      return;
    }


    // ================================
    // CREATE NEW BUSINESS
    // ================================
    const form = new FormData();

    for (const key in formData) {
      let value = formData[key];
      if (key === "website_url") value = normalizeUrl(value);
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

    if (!res.ok) {
      setMessage(data.detail || "Failed to create business.");
      return;
    }

    setMessage("Business added!");
    navigate("/portfolio");
  };

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="add-business-container">
      <div className="business-form">
        <div className="add-business-title">
          {businessId ? "Edit Business" : "Add Business"}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-label">Name</div>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />

          <div className="field-label">Website</div>
          <input
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            required

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />

          <div className="field-label">Picture</div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="field-label">Address</div>
          <input
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            required

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />
          <input
            name="address2"
            value={formData.address2}
            onChange={handleChange}

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />

          <div className="field-label">City</div>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            required

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />

          <div className="field-label">State</div>
          <input
            name="state"
            value={formData.state}
            onChange={handleChange}
            required

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />

          <div className="field-label">Postal Code</div>
          <input
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            required

            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />

          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>

            <button type="submit" className="add-business-button">
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
