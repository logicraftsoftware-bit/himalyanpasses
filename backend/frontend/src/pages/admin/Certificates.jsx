import { useEffect, useState } from "react";
import { API_BASE, apiPostForm, apiDelete } from "../../utils/api";

export default function Certificate() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/certificates`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setCertificates(data);
      } else if (data?.data) {
        setCertificates(data.data);
      } else {
        setCertificates([]);
      }
    } catch (error) {
      console.error("Fetch certificates error:", error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) return;

    setFiles((prev) => [...prev, ...selectedFiles]);

    const newPreviews = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please select images");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      await apiPostForm('/api/certificates/upload', formData);

      alert("Images uploaded successfully");
      setFiles([]);
      setPreviews([]);
      fetchCertificates();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/api/certificates/${id}`);
      alert("Deleted successfully");
      fetchCertificates();
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-xl font-semibold text-gray-800">
          Certificate Images
        </h1>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-md font-semibold text-gray-800">
            Upload Images
          </h2>

          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {previews.length > 0 && (
              <div className="mb-4">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Selected Images: {previews.length}
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {previews.map((item, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border bg-gray-50 p-2"
                    >
                      <img
                        src={item.url}
                        alt={`preview-${index}`}
                        className="h-32 w-full rounded-lg object-cover"
                      />

                      <p className="mt-2 truncate text-xs text-gray-600">
                        {item.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="mt-2 w-full rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload All Images"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-md font-semibold text-gray-800">
            Uploaded Images
          </h2>

          {certificates.length === 0 ? (
            <p className="text-gray-500">No images found.</p>
          ) : (
            <div className="space-y-6">
              {certificates.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                     
                     
                    </div>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {item.imageUrls?.map((img, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl border bg-gray-50"
                      >
                        <img
                          src={img}
                          alt={`uploaded-${index}`}
                          className="h-36 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

