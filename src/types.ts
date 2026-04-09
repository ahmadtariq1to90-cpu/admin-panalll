export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  balance: number;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  created_at: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  status: SubmissionStatus;
  proof_url: string | null;
  created_at: string;
  profiles?: Profile;
  tasks?: Task;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: WithdrawalStatus;
  payment_method: string;
  payment_details: string;
  created_at: string;
  profiles?: Profile;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  commission_earned: number;
  created_at: string;
  referrer?: Profile;
  referred?: Profile;
}

export interface DashboardStats {
  totalUsers: number;
  pendingTasks: number;
  pendingWithdrawals: number;
  totalEarnings: number;
}
