import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./add-business.css";
import { apiFetch } from "../api/client.js";
import { useProtectedData } from "../context/protected-data-provider.jsx";
import { useUIBlocker } from "../context/ui-blocker-provider.jsx";
import Spinner from "../components/spinner";

function AddBusiness() {
  const navigate = useNavigate();
  const { refreshProtectedData } = useProtectedData();
  const { withUIBlock } = useUIBlocker();

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
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ website_url: false });

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
    let cancelled = false;

    const fetchBusiness = async () => {
      try {
        setLoadingBusiness(true);

        const res = await apiFetch(`/api/business/me`);
        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;

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
      } catch (err) {
        console.error("Failed to fetch business:", err);
      } finally {
        if (!cancelled) setLoadingBusiness(false);
      }
    };

    fetchBusiness();

    return () => {
      cancelled = true;
    };
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

    const allowedExt =
      name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png");

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

    // ✅ HARD BLOCK non jpg/png
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

  const isValidWebsite = (value) => {
    const v = (value || "").trim();
    if (!v) return false;
    if (/\s/.test(v)) return false; // no spaces
    return v.includes("."); // simple check
  };

  // ✅ address2 + picture are OPTIONAL (not included here)
  const canSubmit =
    !isSubmitting &&
    !fileError &&
    Boolean(formData.name.trim()) &&
    isValidWebsite(formData.website_url) &&
    Boolean(formData.address1.trim()) &&
    Boolean(formData.city.trim()) &&
    Boolean(formData.state.trim()) &&
    Boolean(formData.postal_code.trim());

  const websiteInvalid = touched.website_url && !isValidWebsite(formData.website_url);


  // ----------------------------------
  // Submit
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched((p) => ({ ...p, website_url: true }));
    setMessage("");

    if (fileError) return;
    if (!canSubmit) return;

    setIsSubmitting(true);

    let buster = Date.now();
    let shouldRedirect = false;

    try {
      await withUIBlock(
        async () => {
          // ================================
          // UPDATE EXISTING BUSINESS
          // ================================
          if (businessId) {
            const payload = {
              ...formData,
              website_url: normalizeUrl(formData.website_url),
            };

            const res = await apiFetch(`/api/business/${businessId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(payload),
            });

            const data = await safeJson(res);

            if (!res.ok) {
              setMessage(data?.detail || "Failed to update business.");
              return;
            }

            // Upload image AFTER business update succeeds
            if (logoFile) {
              const imageForm = new FormData();
              imageForm.append("image", logoFile);

              const imageRes = await apiFetch(
                `/api/business/${businessId}/image`,
                {
                  method: "PATCH",
                  body: imageForm,
                }
              );

              if (!imageRes.ok) {
                setMessage("Business updated, but image upload failed.");
                return;
              }
            }

            await refreshProtectedData();

            buster = Date.now();
            shouldRedirect = true;
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

          await refreshProtectedData();

          buster = Date.now();
          shouldRedirect = true;
        },
        businessId ? "Saving business…" : "Creating business…"
      );
    } catch (err) {
      console.error("Business submit failed:", err);
      setMessage("Failed to submit business. Please try again.");
      return;
    } finally {
      setIsSubmitting(false);
    }

    if (shouldRedirect) {
      navigate("/business-profile", {
        state: { imageBuster: buster },
        replace: true,
      });
    }
  };

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="add-business-container">
      <div className="business-form">
        {loadingBusiness && (
          <div
            className="add-business-loading-overlay"
            aria-label="Loading business"
          >
            <Spinner />
          </div>
        )}

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
            inputMode="text"
          />

          <div className="field-wrap">
            <div className="field-label">Website</div>
            <input
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              onBlur={() => setTouched((p) => ({ ...p, website_url: true }))}
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              inputMode="text"
            />

            {websiteInvalid && (
              <div className="custom-error-popup">
                <div className="error-arrow"></div>
                <div className="error-icon">!</div>
                Please enter a valid website (example: mysite.com)
              </div>
            )}
          </div>

          <div className="field-wrap">
            <div className="field-label">Picture</div>

            <div className={`file-row ${logoFile ? "has-file" : "no-file"}`}>
              <label className="file-btn">
                Choose File
                <input
                  className="file-input"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>

              <span className="file-name">
                {logoFile ? logoFile.name : "No file chosen"}
              </span>
            </div>

            {fileError && (
              <div className="custom-error-popup">
                <div className="error-arrow"></div>
                <div className="error-icon">!</div>
                {fileError}
              </div>
            )}
          </div>



          <div className="field-label">Address</div>
          <input
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="text"
          />

          <input
            name="address2"
            value={formData.address2}
            onChange={handleChange}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="text"
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
            inputMode="text"
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
            inputMode="text"
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
            inputMode="numeric"
          />

          {message && <div className="Error_Message">{message}</div>}

          <button
            className="no-business-button"
            type="submit"
            disabled={!canSubmit}
          >
            {businessId ? "Save Changes" : "Add Business"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddBusiness;
