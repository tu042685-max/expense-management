import { useState } from "react";
import { X, Mail, Calendar, Copy, Check, Edit, Save } from "lucide-react";
import { authAPI } from "../utils/api";
import { showToast } from "../utils/toast";
import type { User } from "../types";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onProfileUpdated: (user: User) => void;
}

export default function ProfileModal({ user, onClose, onProfileUpdated }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    profileAvatar: user.profileAvatar || "",
  });

  const copyToClipboard = async () => {
    try {
      // Use modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(user.id);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = user.id;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      
      setCopiedId(true);
      showToast.success("User ID copied to clipboard!");
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast.error("Failed to copy User ID");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        profileAvatar: formData.profileAvatar,
      });
      onProfileUpdated(response.data.user);
      showToast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "Error updating profile";
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      profileAvatar: user.profileAvatar || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-5 flex items-center justify-between sm:mb-6">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">My Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Avatar
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-600">
                <span className="text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {isEditing && (
                <input
                  type="text"
                  value={formData.profileAvatar}
                  onChange={(e) =>
                    setFormData({ ...formData, profileAvatar: e.target.value })
                  }
                  placeholder="Avatar URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-900 font-medium">{user.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <p className="text-gray-900 text-sm break-all">{user.email}</p>
            </div>
          </div>

          {/* User ID with Copy Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-xs font-mono bg-gray-100 p-2 rounded text-gray-700 break-all">
                {user.id}
              </p>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 flex-shrink-0"
                title="Copy User ID"
              >
                {copiedId ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Member Since */}
          {user.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-gray-900 text-sm">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
