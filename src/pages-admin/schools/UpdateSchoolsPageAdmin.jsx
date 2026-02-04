import React, { useState, useEffect } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { request } from "../../util/request";
import toast from "react-hot-toast";
import { format } from "date-fns";

const UpdateSchoolsPageAdmin = () => {
  const { schoolId: id } = useParams(); // Use 'schoolId' and alias it to 'id' for minimal changes
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    principal_id: "",
    address: "",
    phone_number: "",
    email: "",
    founded_date: "",
    school_level: "",
    status: "active",
    logo: null,
    cover: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't fetch data until the ID from the URL is available
    if (!id) {
      setLoading(false);
      setError("School ID is missing.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state on new fetch
      try {
        // Fetch school data and unassigned principals in parallel for efficiency
        const [schoolRes, principalsRes] = await Promise.all([
          request(`/schools/${id}`, "GET"),
          request("/principals/unassigned", "GET"),
        ]);
        const schoolData = schoolRes?.data;
        if (!schoolData) {
          throw new Error("School not found.");
        }

        const unassignedPrincipals = principalsRes?.data || [];

        // If the school has a current principal, add them to the list so they can be re-selected
        let allPrincipals = [...unassignedPrincipals];
        if (schoolData.principal_id && schoolData.director_name) {
          const currentPrincipalExists = allPrincipals.some(
            (p) => p.id === schoolData.principal_id
          );
          if (!currentPrincipalExists) {
            allPrincipals.unshift({
              id: schoolData.principal_id, // This now comes from the API
              name: schoolData.director_name,
            });
          }
        }
        setPrincipals(allPrincipals);

        // Format date for the HTML date input, which requires 'yyyy-MM-dd'
        const formattedDate = schoolData.founded_date
          ? format(new Date(schoolData.founded_date), "yyyy-MM-dd")
          : "";

        setFormData({
          ...schoolData,
          founded_date: formattedDate,
          principal_id: schoolData.principal_id ?? "", // Use nullish coalescing for clarity
        });
        setLogoPreview(schoolData.logo);
        setCoverPreview(schoolData.cover);
      } catch (err) {
        toast.error("Failed to load school data.");
        setError(err.message || "An unknown error occurred.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") {
          setLogoPreview(reader.result);
          setFormData((prev) => ({ ...prev, logo: reader.result }));
        } else {
          setCoverPreview(reader.result);
          setFormData((prev) => ({ ...prev, cover: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await request(`/schools/${id}`, "PUT", formData);
      toast.success("School updated successfully!");
      navigate("/admin/schools");
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || "Failed to update school."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/schools");
  };

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus,
    }));
    setIsDropdownOpen(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-0">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm mt-6 mx-6">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              កែសម្រួលព័ត៌មានសាលា
            </h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition text-sm font-normal ${
                  formData.status === "active"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                <span>
                  {formData.status === "active"
                    ? "កំពុងដំណើរការ"
                    : "ផ្អាកដំណើរការ"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("active")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    កំពុងដំណើរការ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange("inactive")}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    ផ្អាកដំណើរការ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* School Info, Principals, etc. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ឈ្មោះសាលា
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ឈ្មោះនាយកសាលា
                </label>
                <select
                  name="principal_id"
                  value={formData.principal_id || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- មិនមាននាយកសាលា --</option>
                  {principals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:row-span-2">
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  អាសយដ្ឋាននៃសាលា
                </label>
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  លេខទូរស័ព្ទ
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  អ៊ីមែលរបស់សាលា
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* School Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ថ្ងៃបង្កើត
                </label>
                <input
                  type="date"
                  name="founded_date"
                  value={formData.founded_date || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  កម្រិតសាលា
                </label>
                <select
                  name="school_level"
                  value={formData.school_level || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value=""></option>
                  <option value="Kindergarten">មត្តេយ្យ (Kindergarten)</option>
                  <option value="Primary">បឋមសិក្សា (Primary)</option>
                  <option value="Secondary">អនុវិទ្យាល័យ (Secondary)</option>
                  <option value="High School">វិទ្យាល័យ (High School)</option>
                </select>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Logo សាលា
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer block">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-20 h-20 mx-auto rounded object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          ចុចដើម្បីបញ្ចូលរូប
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              {/* Cover Upload */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Cover សាលា
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-gray-400">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "cover")}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="cursor-pointer block"
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="w-full h-20 mx-auto rounded object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          ចុចដើម្បីបញ្ចូលរូប
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-normal"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-800 font-normal disabled:opacity-50"
              >
                {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុកការផ្លាស់ប្តូរ"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateSchoolsPageAdmin;