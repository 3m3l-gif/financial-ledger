
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE'; // Internal type for grouping
  color: string;
}

export interface Method {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  categoryId?: string; // Optional for transfers
  methodId?: string;   // Optional for transfers
  accountId: string;   // From account
  targetAccountId?: string; // For transfers
  amount: number;
  date: string;
  memo: string;
  savingsId?: string;
}

export interface SavingsGoal {
  id: string;
  purpose: string;
  currentAmount: number;
  targetAmount: number;
  order: number;
}

export interface UserData {
  username: string;
  transactions: Transaction[];
  categories: Category[]; // Renamed internally as 'Types'
  methods: Method[];       // Renamed internally as 'Methods'
  accounts: Account[];     // New: Bank accounts
  savings: SavingsGoal[];
}

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
}
