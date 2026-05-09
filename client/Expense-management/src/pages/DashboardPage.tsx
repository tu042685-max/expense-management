import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { groupAPI, authAPI } from "../utils/api";
import { Plus, Users, MoreVertical, Search, X } from "lucide-react";
import { showToast, toastMessages } from "../utils/toast";
import type { Group, User } from "../types";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    loadGroups();
    
    // Set up polling for real-time updates
    // const interval = setInterval(() => {
    //   loadGroups();
    // }, 5000); // Poll every 5 seconds

    // return () => clearInterval(interval);
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await groupAPI.getMyGroups();
      setGroups(res.data);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await authAPI.searchUsers(query);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const addInvitedUser = (user: User) => {
    if (!invitedUsers.find(u => u.id === user.id)) {
      setInvitedUsers([...invitedUsers, user]);
    }
    setUserSearch("");
    setSearchResults([]);
  };

  const removeInvitedUser = (userId: string) => {
    setInvitedUsers(invitedUsers.filter(u => u.id !== userId));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await groupAPI.createGroup({
        name: groupName,
        description: groupDesc,
        inviteUserIds: invitedUsers.map(u => u.id),
      });
      setGroupName("");
      setGroupDesc("");
      setInvitedUsers([]);
      setShowCreateModal(false);
      showToast.success(toastMessages.groupCreated);
      if (invitedUsers.length > 0) {
        showToast.success(toastMessages.invitationSent);
      }
      loadGroups();
    } catch (err: any) {
      console.error("Error creating group:", err);
      const message = err.response?.data?.message || toastMessages.groupError;
      showToast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Groups</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-medium text-white transition hover:shadow-lg sm:w-auto sm:px-6 sm:py-2"
            >
              <Plus className="h-5 w-5" />
              New Group
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 md:p-8">
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Vacation 2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                      placeholder="Goa trip with friends"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Invite Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Members by User ID (optional)
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          searchUsers(e.target.value);
                        }}
                        placeholder="Enter a user ID"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 ? (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => addInvitedUser(user)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.id}</div>
                          </button>
                        ))}
                      </div>
                    ) : userSearch.trim() ? (
                      <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        No user found for that ID.
                      </div>
                    ) : null}

                    {/* Invited Users */}
                    {invitedUsers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Added Members:</p>
                        {invitedUsers.map((user) => (
                          <div key={user.id} className="flex flex-col gap-2 rounded-lg bg-indigo-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <span className="font-medium text-gray-900">{user.name}</span>
                              <span className="ml-0 block text-sm text-gray-600 sm:ml-2 sm:inline">
                                ({user.email})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeInvitedUser(user.id)}
                              className="self-end text-red-600 hover:text-red-800 sm:self-auto"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setInvitedUsers([]);
                        setUserSearch("");
                        setSearchResults([]);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : groups.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No groups yet</h2>
            <p className="text-gray-600 mb-6">Create a group to start tracking expenses</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 sm:w-auto sm:py-2"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className="cursor-pointer rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{group.members?.length || 0} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
