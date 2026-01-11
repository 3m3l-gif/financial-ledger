
import { UserData, Category, Transaction, SavingsGoal, TransactionType, Method, Account } from '../types';

const USERS_KEY = 'ledger_users_db';
const SESSION_KEY = 'ledger_session';
const AUTO_LOGIN_USER_KEY = 'ledger_auto_login_user';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: '급여', type: 'INCOME', color: '#10b981' },
  { id: '2', name: '보너스', type: 'INCOME', color: '#34d399' },
  { id: '3', name: '용돈', type: 'INCOME', color: '#6ee7b7' },
  { id: '4', name: '식비', type: 'EXPENSE', color: '#f43f5e' },
  { id: '5', name: '교통', type: 'EXPENSE', color: '#fb923c' },
  { id: '6', name: '주거', type: 'EXPENSE', color: '#facc15' },
  { id: '7', name: '의료', type: 'EXPENSE', color: '#8b5cf6' },
  { id: '8', name: '취미', type: 'EXPENSE', color: '#ec4899' },
];

const DEFAULT_METHODS: Method[] = [
  { id: 'p1', name: '현금' },
  { id: 'p2', name: '신용카드' },
  { id: 'p3', name: '체크카드' },
  { id: 'p4', name: '상품권' },
];

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'a1', name: '주거래은행' },
  { id: 'a2', name: '비상금통장' },
  { id: 'a3', name: '현금지갑' },
];

export const storage = {
  getUsers: () => JSON.parse(localStorage.getItem(USERS_KEY) || '{}'),
  
  saveUser: (username: string, password: string): boolean => {
    const users = storage.getUsers();
    if (users[username]) return false;
    users[username] = {
      password,
      pin: null,
      data: {
        username,
        transactions: [],
        categories: DEFAULT_CATEGORIES,
        methods: DEFAULT_METHODS,
        accounts: DEFAULT_ACCOUNTS,
        savings: []
      }
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  verifyUser: (username: string, password: string): UserData | null => {
    const users = storage.getUsers();
    if (users[username] && users[username].password === password) {
      return users[username].data;
    }
    return null;
  },

  setUserPin: (username: string, pin: string) => {
    const users = storage.getUsers();
    if (users[username]) {
      users[username].pin = pin;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  verifyPin: (username: string, pin: string): UserData | null => {
    const users = storage.getUsers();
    if (users[username] && users[username].pin === pin) {
      return users[username].data;
    }
    return null;
  },

  updateUserData: (username: string, data: Partial<UserData>) => {
    const users = storage.getUsers();
    if (users[username]) {
      users[username].data = { ...users[username].data, ...data };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  setSession: (username: string) => {
    localStorage.setItem(SESSION_KEY, username);
  },

  getSession: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  setAutoLoginUser: (username: string | null) => {
    if (username) {
      localStorage.setItem(AUTO_LOGIN_USER_KEY, username);
    } else {
      localStorage.removeItem(AUTO_LOGIN_USER_KEY);
    }
  },

  getAutoLoginUser: (): string | null => {
    return localStorage.getItem(AUTO_LOGIN_USER_KEY);
  }
};
