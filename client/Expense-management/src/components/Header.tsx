import { useNavigate } from "react-router-dom";
import { LogOut, User, Home, Bell, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { notificationAPI, invitationAPI } from "../utils/api";
import { showToast, toastMessages } from "../utils/toast";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingInvitationsCount, setPendingInvitationsCount] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  // Fetch unread notifications and pending invitations
  useEffect(() => {
    if (!user) return;

    setCurrentUser(user);

    const fetchCounts = async () => {
      try {
        const [notificationsRes, invitationsRes] = await Promise.all([
          notificationAPI.getMyNotifications(),
          invitationAPI.getMyInvitations(),
        ]);

        // Count unread notifications
        const unread = notificationsRes.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);

        // Count pending invitations
        const pending = invitationsRes.data.filter((i) => i.status === "pending").length;
        setPendingInvitationsCount(pending);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
    // Refresh counts every 10 seconds
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    showToast.success(toastMessages.logoutSuccess);
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-lg font-bold text-indigo-600 transition hover:text-indigo-700 sm:text-xl"
          >
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="truncate">SplitFlow</span>
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 sm:px-4"
              title="View Profile"
            >
              <User className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              <span className="max-w-28 truncate font-medium sm:max-w-40">
                {user?.name}
              </span>
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white sm:right-1 sm:top-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/invitations")}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-2"
              title="Invitations"
            >
              <Mail className="h-4 w-4" />
              {pendingInvitationsCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white sm:right-1 sm:top-1">
                  {pendingInvitationsCount > 9 ? "9+" : pendingInvitationsCount}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            setShowProfileModal(false);
          }}
        />
      )}
    </header>
  );
}
