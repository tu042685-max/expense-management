import { useState, useEffect } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../utils/api";
import { User as UserIcon, Mail, Calendar, Edit, Save } from "lucide-react";
import type { User } from "../types/index";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(user || null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    profileAvatar: user?.profileAvatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        profileAvatar: response.data.profileAvatar || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      await authAPI.updateProfile({
        name: formData.name,
        profileAvatar: formData.profileAvatar,
      });
      setMessage("Profile updated successfully");
      setIsEditing(false);
      await loadProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Profile</h1>
            <button
              onClick={() => {
                if (isEditing) {
                  setFormData({ name: profile.name, profileAvatar: profile.profileAvatar || "" });
                }
                setIsEditing(!isEditing);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 sm:w-auto sm:py-2"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Avatar Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Avatar
              </label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-600">
                  <UserIcon className="h-8 w-8 text-white" />
                </div>
                {isEditing && (
                  <input
                    type="text"
                    value={formData.profileAvatar}
                    onChange={(e) => setFormData({ ...formData, profileAvatar: e.target.value })}
                    placeholder="Avatar URL"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-lg text-gray-900 font-medium">{profile.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2 text-gray-900">
                <Mail className="h-5 w-5 text-gray-400" />
                <p className="text-lg">{profile.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-700 break-all">
                {profile.id}
              </p>
            </div>

            {/* Created Date */}
            {profile.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="text-lg">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
