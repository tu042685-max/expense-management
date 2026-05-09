export interface User {
  id: string;
  name: string;
  email: string;
  profileAvatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  creator?: User;
  members?: GroupMember[];
  invitations?: GroupInvitation[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  user?: User;
  joinedAt?: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: "pending" | "accepted" | "rejected";
  group?: Group;
  invitedUser?: User;
  invitedBy?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description?: string;
  paidBy: string;
  paidByUser?: User;
  groupId: string;
  splits?: ExpenseSplit[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  shareAmount: number;
  user?: User;
}

export interface DebtPayment {
  id: string;
  amount: number;
  paidBy: string;
  paidTo: string;
  groupId: string;
  createdAt?: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  fromUser?: { name: string; email: string };
  toUser?: { name: string; email: string };
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "group_created"
    | "invitation_received"
    | "invitation_accepted"
    | "invitation_rejected"
    | "debt_payment_completed";
  message: string;
  groupId?: string;
  invitationId?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}
