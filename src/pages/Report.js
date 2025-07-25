import { useState } from "react";

export default function Report() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [category, setCategory] = useState("violation");
  const [severity, setSeverity] = useState("medium");
  const navigate = (path) => {
    // Mock navigation function - replace with actual navigation logic
    console.log(`Navigating to: ${path}`);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const formattedLocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocation(formattedLocation);
        setUseCurrentLocation(true);
        setLocationLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Could not access your location. Please enter it manually.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setMedia(null);
      setMediaPreview(null);
      return;
    }

    // File size validation (50MB)
    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      e.target.value = ''; // Clear the input
      return;
    }

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV) file.');
      e.target.value = ''; // Clear the input
      return;
    }

    setMedia(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview({
        url: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      });
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    // Clear the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!description.trim()) {
      alert("Please provide a description of the violation.");
      return;
    }

    if (!location.trim()) {
      alert("Please specify the location of the violation.");
      return;
    }

    if (description.trim().length < 10) {
      alert("Please provide a more detailed description (at least 10 characters).");
      return;
    }

    setLoading(true);

    try {
      // Mock user object - replace with actual auth
      const user = { uid: "mock-user-id", email: "user@example.com" };
      
      let mediaUrl = null;
      let mediaType = null;

      // Mock file upload - replace with actual Firebase storage upload
      if (media) {
        console.log("Uploading file...", media.name);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        mediaUrl = URL.createObjectURL(media); // Mock URL
        mediaType = media.type.startsWith('image/') ? 'image' : 'video';
        console.log("File uploaded successfully:", mediaUrl);
      }

      const reportData = {
        reportedBy: user.uid,
        reporterEmail: user.email,
        description: description.trim(),
        location: location.trim(),
        mediaUrl,
        mediaType,
        status: "pending",
        likes: [],
        comments: [],
        submittedAt: new Date().toISOString(),
        coordinates: currentLocation || null,
        severity,
        category,
        resolved: false,
        adminNotes: ""
      };

      console.log("Submitting report data:", reportData);
      // Mock database save - replace with actual Firestore save
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Report submitted successfully");

      // Success feedback
      alert("Your report has been submitted successfully! Thank you for helping improve our community.");
      
      // Reset form
      setDescription("");
      setLocation("");
      setMedia(null);
      setMediaPreview(null);
      setUseCurrentLocation(false);
      setCurrentLocation(null);
      setCategory("violation");
      setSeverity("medium");
      
      // Navigate back
      navigate("/forum");
      
    } catch (err) {
      console.error("Submission error:", err);
      alert(`Failed to submit report: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
            📢
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Report a Violation
          </h1>
          <p className="text-slate-600">Help us maintain a safe and clean community</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-8">
            <div onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Report Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'violation', label: 'Code Violation', icon: '⚠️' },
                    { value: 'maintenance', label: 'Maintenance Issue', icon: '🔧' },
                    { value: 'safety', label: 'Safety Concern', icon: '🚨' },
                    { value: 'other', label: 'Other', icon: '📝' }
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                        category === cat.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="font-medium text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Please provide a detailed description of the violation or issue. Include specific details like what happened, when it occurred, and any other relevant information..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
                <div className="mt-1 text-xs text-slate-500">
                  {description.length}/500 characters (minimum 10 required)
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location *
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      useCurrentLocation
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-300 hover:border-slate-400 text-slate-600'
                    } ${locationLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
                  >
                    {locationLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Getting location...</span>
                      </>
                    ) : useCurrentLocation ? (
                      <>
                        <span>✅</span>
                        <span>Using current location</span>
                      </>
                    ) : (
                      <>
                        <span>📍</span>
                        <span>Use current location</span>
                      </>
                    )}
                  </button>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setUseCurrentLocation(false);
                      }}
                      required
                      placeholder="Or enter address, building name, or landmark..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Low', color: 'text-green-700 border-green-300 bg-green-50', icon: '🟢' },
                    { value: 'medium', label: 'Medium', color: 'text-yellow-700 border-yellow-300 bg-yellow-50', icon: '🟡' },
                    { value: 'high', label: 'High', color: 'text-red-700 border-red-300 bg-red-50', icon: '🔴' }
                  ].map((sev) => (
                    <button
                      key={sev.value}
                      type="button"
                      onClick={() => setSeverity(sev.value)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                        severity === sev.value
                          ? sev.color
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <span>{sev.icon}</span>
                      <span className="font-medium text-sm">{sev.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Photo or Video (Optional)
                </label>
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                      id="media-upload"
                    />
                    <label
                      htmlFor="media-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        📎
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium">Click to upload a file</p>
                        <p className="text-slate-400 text-sm">Images: JPG, PNG, GIF, WebP | Videos: MP4, WebM, MOV</p>
                        <p className="text-slate-400 text-xs">Maximum file size: 50MB</p>
                      </div>
                    </label>
                  </div>

                  {/* Media Preview */}
                  {mediaPreview && (
                    <div className="relative border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <button
                        type="button"
                        onClick={removeMedia}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                      {mediaPreview.type === 'image' ? (
                        <img
                          src={mediaPreview.url}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={mediaPreview.url}
                          controls
                          className="w-full h-40 rounded-lg"
                        />
                      )}
                      <p className="text-sm text-slate-600 mt-2 flex items-center space-x-2">
                        <span>📎</span>
                        <span>{media?.name}</span>
                        <span className="text-slate-400">({(media?.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !description.trim() || !location.trim() || description.length < 10}
                  className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Report...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>📤</span>
                      <span>Submit Report</span>
                    </div>
                  )}
                </button>
                
                <p className="text-center text-slate-500 text-sm mt-3">
                  Your report will be reviewed by our team within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/forum")}
            className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            ← Back to Forum
          </button>
        </div>
      </div>
    </div>
  );
}