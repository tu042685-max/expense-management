import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { groupAPI, expenseAPI } from "../utils/api";
import { ChevronLeft, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { showToast, toastMessages } from "../utils/toast";
import type { Group } from "../types";

export default function AddExpensePage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    paidBy: "",
    selectedMembers: [] as string[],
  });

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      if (!groupId) return;
      const res = await groupAPI.getGroupById(groupId);
      setGroup(res.data);
      setFormData((prev) => ({
        ...prev,
        paidBy: user?.id || "",
        selectedMembers: res.data.members?.map((m) => m.userId) || [],
      }));
    } catch (err) {
      console.error("Error loading group:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(memberId)
        ? prev.selectedMembers.filter((id) => id !== memberId)
        : [...prev.selectedMembers, memberId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!groupId || !formData.amount || formData.selectedMembers.length === 0) {
        showToast.error("Please fill all required fields");
        setSubmitting(false);
        return;
      }

      await expenseAPI.addExpense({
        amount: parseFloat(formData.amount),
        description: formData.description,
        groupId,
        paidBy: formData.paidBy,
        splitAmongUserIds: formData.selectedMembers,
      });

      showToast.success(toastMessages.expenseAdded);
      navigate(`/group/${groupId}`);
    } catch (err: any) {
      console.error("Error adding expense:", err);
      const message = err.response?.data?.message || toastMessages.expenseError;
      showToast.error(message);
      setSubmitting(false);
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

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-12">
          <p className="text-gray-600">Group not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Group
        </button>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Add Expense</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this for?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid By *
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {group.members?.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Among */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Split Among *
              </label>
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <label
                    key={member.userId}
                    className="flex items-start gap-3 rounded-lg border border-gray-300 p-3 transition hover:bg-gray-50 sm:items-center"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedMembers.includes(member.userId)}
                      onChange={() => handleMemberToggle(member.userId)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{member.user?.name}</p>
                      <p className="text-sm text-gray-600">{member.user?.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Per Person Amount */}
            {formData.amount && formData.selectedMembers.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Per person: <span className="font-bold text-indigo-600">
                    ₹{(parseFloat(formData.amount) / formData.selectedMembers.length).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => navigate(`/group/${groupId}`)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
