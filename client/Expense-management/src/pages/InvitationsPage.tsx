import { useState, useEffect } from "react";
import Header from "../components/Header";
import { invitationAPI } from "../utils/api";
import { Check, X, Users, Clock } from "lucide-react";
import { showToast, toastMessages } from "../utils/toast";
import type { GroupInvitation } from "../types";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const res = await invitationAPI.getMyInvitations();
      setInvitations(res.data);
    } catch (err) {
      console.error("Error loading invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    setProcessing(invitationId);
    try {
      await invitationAPI.acceptInvitation(invitationId);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      showToast.success(toastMessages.invitationAccepted);
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      const message = err.response?.data?.message || "Error accepting invitation";
      showToast.error(message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (invitationId: string) => {
    setProcessing(invitationId);
    try {
      await invitationAPI.rejectInvitation(invitationId);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      showToast.success(toastMessages.invitationRejected);
    } catch (err: any) {
      console.error("Error rejecting invitation:", err);
      const message = err.response?.data?.message || "Error rejecting invitation";
      showToast.error(message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
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

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">My Invitations</h1>
          <p className="text-gray-600">Manage your group invitations</p>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-600">You're all caught up! Check back later for new invitations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {invitation.group?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Invited by {invitation.invitedBy?.name}
                        </p>
                      </div>
                    </div>

                    {invitation.group?.description && (
                      <p className="text-gray-600 mb-3">{invitation.group.description}</p>
                    )}

                    <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{invitation.group?.members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(invitation.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:ml-4 lg:w-auto">
                    <button
                      onClick={() => handleAccept(invitation.id)}
                      disabled={processing === invitation.id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {processing === invitation.id ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleReject(invitation.id)}
                      disabled={processing === invitation.id}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      {processing === invitation.id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
