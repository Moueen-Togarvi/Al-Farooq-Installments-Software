export type CustomerStatus = 'Active' | 'Defaulter' | 'Closed';

export interface DashboardStats {
  totalCustomers: number;
  activePlans: number;
  totalReceived: number;
  totalPending: number;
  dueToday: number;
  overdueCustomers: number;
  monthlyIncome: number;
}
