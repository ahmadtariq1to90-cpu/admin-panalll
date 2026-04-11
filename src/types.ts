export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_country: string | null;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  postal_code: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  birthday: string | null;
  gender: string | null;
  avatar_url: string | null;
  profile_image: string | null;
  "profile-image": string | null;
  profile_image_url: string | null;
  profile_pic: string | null;
  role: UserRole;
  balance: number;
  referral_code: string;
  referred_by: string | null;
  total_tasks_completed: number;
  total_withdraw: number;
  referral_earnings: number;
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
  users?: User;
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
  users?: User;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  commission_earned: number;
  created_at: string;
  referrer?: User;
  referred?: User;
}

export interface DashboardStats {
  totalUsers: number;
  pendingTasks: number;
  pendingWithdrawals: number;
  totalEarnings: number;
}
