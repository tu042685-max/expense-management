import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";


import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { groupAPI, expenseAPI } from "../utils/api";
import { Plus, ChevronLeft, Users, TrendingUp, TrendingDown } from "lucide-react";
import { showToast, toastMessages } from "../utils/toast";

import type { Expense, Group, Settlement } from "../types";




export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"expenses" | "settlement">("expenses");

  const [payModal, setPayModal] = useState<{
    open: boolean;
    toUserId: string | null;
    defaultAmount: number;
  }>({ open: false, toUserId: null, defaultAmount: 0 });

  const [payAmount, setPayAmount] = useState<string>("");
  const [paySubmitting, setPaySubmitting] = useState(false);

  const openPayModal = (toUserId: string, defaultAmount: number) => {
    setPayModal({ open: true, toUserId, defaultAmount });
    setPayAmount(defaultAmount.toFixed(2));
  };

  const closePayModal = () => {
    setPayModal({ open: false, toUserId: null, defaultAmount: 0 });
    setPaySubmitting(false);
    setPayAmount("");
  };

  const handleSubmitPay = async () => {
    if (!groupId || !userId) return;
    if (!payModal.toUserId) return;

    const parsed = Number(payAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    try {
      setPaySubmitting(true);
      await expenseAPI.payDebt(groupId, { toUserId: payModal.toUserId, amount: parsed });

      const [, , settlementRes] = await Promise.all([
        groupAPI.getGroupById(groupId),
        expenseAPI.getGroupExpenses(groupId),
        expenseAPI.getSettlement(groupId),
      ]);

      setSettlements(settlementRes.data.settlements);
      setBalances(settlementRes.data.balances);

      showToast.success(toastMessages.paymentSuccess);
      closePayModal();
    } catch (err) {
      console.error("Error completing payment:", err);
      showToast.error(toastMessages.paymentError);
      setPaySubmitting(false);
    }
  };



  const { user } = useAuth();
  // logged-in user id is used for “You are owed/You owe” cards
  const userId = user?.id;

  useEffect(() => {

    const loadGroupData = async () => {
      try {
        setLoading(true);
        if (!groupId || !userId) return;

        const [groupRes, expensesRes, settlementRes] = await Promise.all([
          groupAPI.getGroupById(groupId),
          expenseAPI.getGroupExpenses(groupId),
          expenseAPI.getSettlement(groupId),
        ]);

        setGroup(groupRes.data);
        setExpenses(expensesRes.data);
        setSettlements(settlementRes.data.settlements);
        setBalances(settlementRes.data.balances);
      } catch (err) {
        console.error("Error loading group data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupId, userId]);

  




  const getTotalExpenses = () => {

    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getUserBalance = (userId: string) => {
    return balances[userId] || 0;
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

      {/* Pay Modal */}
      {payModal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900 sm:text-xl">Repay</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay to
                </label>
                <div className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900">
                  {group?.members?.find((m) => m.userId === payModal.toUserId)?.user?.name ?? "Member"}
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  inputMode="decimal"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  onClick={closePayModal}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPay}
                  disabled={paySubmitting}
                  className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {paySubmitting ? "Processing..." : "Confirm Pay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Groups
          </button>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">{group.name}</h1>
            {group.description && (
              <p className="text-gray-600 mb-4">{group.description}</p>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>{group.members?.length || 0} members</span>
              </div>
              <button
                onClick={() => navigate(`/group/${groupId}/add-expense`)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-medium text-white transition hover:shadow-lg sm:w-auto sm:py-2"
              >
                <Plus className="h-5 w-5" />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 sm:mb-8">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">₹{getTotalExpenses().toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">You are Owed</p>
                <p className="mt-2 text-2xl font-bold text-green-600 sm:text-3xl">
                  ₹{Math.max(0, getUserBalance(userId || "")).toFixed(2)}
                </p>


              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">You Owe</p>
                <p className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">
                  ₹{Math.max(0, -getUserBalance(userId || "")).toFixed(2)}
                </p>



              </div>
              <TrendingDown className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`flex-1 px-3 py-3 text-sm font-medium transition sm:px-6 sm:py-4 sm:text-base ${
                activeTab === "expenses"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab("settlement")}
              className={`flex-1 px-3 py-3 text-sm font-medium transition sm:px-6 sm:py-4 sm:text-base ${
                activeTab === "settlement"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Settlement ({settlements.length})
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "expenses" ? (
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No expenses yet</p>
                ) : (
                  expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{expense.description || "Expense"}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Paid by {expense.paidByUser?.name}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 sm:text-right">₹{expense.amount.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {settlements.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">All settled up!</p>
                ) : (
                  settlements.map((settlement, i) => {
                    const isYouOwe = userId && settlement.from === userId;

                    return (
                      <div
                        key={i}
                        className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {settlement.fromUser?.name} pays {settlement.toUser?.name}
                          </p>
                          {isYouOwe && (
                            <p className="text-sm text-gray-600 mt-1">
                              You can repay this now.
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <p className="text-lg font-bold text-blue-600">
                            ₹{settlement.amount.toFixed(2)}
                          </p>
                          {isYouOwe && (
                            <button
                              onClick={() =>
                                openPayModal(
                                  settlement.to,
                                  settlement.amount
                                )
                              }
                              className="px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {group.members?.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{member.user?.name}</p>
                  <p className="text-sm text-gray-600">{member.user?.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  {balances[member.userId] > 0 ? (
                    <p className="text-sm font-medium text-green-600">
                      Owed ₹{balances[member.userId].toFixed(2)}
                    </p>
                  ) : balances[member.userId] < 0 ? (
                    <p className="text-sm font-medium text-red-600">
                      Owes ₹{Math.abs(balances[member.userId]).toFixed(2)}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-gray-600">Settled</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
