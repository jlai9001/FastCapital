import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./add-business.css";
import { apiFetch } from "../api/client.js";
import { useProtectedData } from "../context/protected-data-provider.jsx";

function AddBusiness() {
  const navigate = useNavigate();
  const { refreshProtectedData } = useProtectedData();

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
  const [fileError, setFileError] = useState(""); // ✅ file-type warning
  const [message, setMessage] = useState("");

  const normalizeUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) return "https://" + url;
    return url;
  };

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ----------------------------------
  // Fetch existing business (edit mode)
  // ----------------------------------
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await apiFetch(`/api/business/me`);

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isAllowedImage = (file) => {
    const allowedMimes = new Set(["image/jpeg", "image/png"]);
    const name = (file?.name || "").toLowerCase();

    // Some browsers may provide an empty type for certain files → also check extension
    const allowedExt =
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png");

    return allowedMimes.has(file.type) || allowedExt;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    // user canceled selection
    if (!file) {
      setLogoFile(null);
      setFileError("");
      return;
    }

    // ✅ HARD BLOCK non jpg/png/svg
    if (!isAllowedImage(file)) {
      setLogoFile(null);
      setFileError("File type must be jpg or png");

      // Clear the input so the user can't "keep" the invalid file selected
      e.target.value = "";
      return;
    }

    setFileError("");
    setLogoFile(file);
  };

  // ----------------------------------
  // Submit
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Don’t allow submit if file is invalid
    if (fileError) return;

    // ================================
    // UPDATE EXISTING BUSINESS
    // ================================
    if (businessId) {
      const payload = {
        ...formData,
        website_url: normalizeUrl(formData.website_url),
      };

      // 1) Update business details
      const res = await apiFetch(`/api/business/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      // 2) Stop if failed
      if (!res.ok) {
        setMessage(data?.detail || "Failed to update business.");
        return;
      }

      // 3) Upload image AFTER business update succeeds
      if (logoFile) {
        const imageForm = new FormData();
        imageForm.append("image", logoFile);

        const imageRes = await apiFetch(`/api/business/${businessId}/image`, {
          method: "PATCH",
          body: imageForm,
        });

        if (!imageRes.ok) {
          setMessage("Business updated, but image upload failed.");
          return;
        }
      }

      // 4) Navigate ONCE, at the end, with a cache-buster
      const buster = Date.now();
      await refreshProtectedData();
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

    const res = await apiFetch(`/api/business`, {
      method: "POST",
      body: form,
    });

    const data = await safeJson(res);

    if (!res.ok) {
      setMessage(data?.detail || "Failed to create business.");
      return;
    }

    setMessage("Business added!");
    await refreshProtectedData();
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

          <div className={`file-row ${logoFile ? "has-file" : "no-file"}`}>
            <label className="file-btn">
              Choose File
              <input
                className="file-input"
                type="file"
                // ✅ restrict picker + validate onChange (don’t rely on accept alone)
                accept="image/jpeg,image/png,image/svg+xml,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </label>

            <span className="file-name">
              {logoFile ? logoFile.name : "No file chosen"}
            </span>
          </div>

          {/* ✅ field-level warning */}
          {fileError && <div className="message">{fileError}</div>}

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

          {message && <div className="Error_Message">{message}</div>}

          <button className="no-business-button" type="submit">
            {businessId ? "Save Changes" : "Add Business"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBusiness;
