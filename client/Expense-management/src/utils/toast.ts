import { toast } from "react-toastify";

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  loading: (message: string) => toast.loading(message),
};

// Common toast messages
export const toastMessages = {
  // Auth
  loginSuccess: "✓ Logged in successfully!",
  signupSuccess: "✓ Account created successfully!",
  logoutSuccess: "✓ Logged out successfully!",
  loginError: "✗ Login failed. Please check your credentials.",
  signupError: "✗ Signup failed. Please try again.",
  
  // Expenses
  expenseAdded: "✓ Expense added successfully!",
  expenseUpdated: "✓ Expense updated successfully!",
  expenseDeleted: "✓ Expense deleted successfully!",
  expenseError: "✗ Failed to add expense. Please try again.",
  
  // Payments
  paymentSuccess: "✓ Payment completed successfully!",
  paymentError: "✗ Payment failed. Please try again.",
  
  // Groups
  groupCreated: "✓ Group created successfully!",
  groupError: "✗ Failed to create group. Please try again.",
  
  // Invitations
  invitationSent: "✓ Invitation sent successfully!",
  invitationAccepted: "✓ Invitation accepted!",
  invitationRejected: "✓ Invitation rejected!",
  invitationError: "✗ Failed to send invitation. Please try again.",
  
  // Generic
  success: "✓ Operation completed successfully!",
  error: "✗ Something went wrong. Please try again.",
  loading: "⏳ Processing...",
};
