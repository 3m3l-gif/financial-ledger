
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import TransactionManager from './components/TransactionManager';
import Savings from './components/Savings';
import Settings from './components/Settings';
import { storage } from './utils/storage';
import { UserData, Transaction, Category, SavingsGoal, Method, Account } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const sessionUser = storage.getSession();
    if (sessionUser) {
      const users = storage.getUsers();
      if (users[sessionUser]) {
        setIsLoggedIn(true);
        setCurrentUser(sessionUser);
        setUserData(users[sessionUser].data);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && userData) {
      storage.updateUserData(currentUser, userData);
    }
  }, [userData, currentUser]);

  const handleLogin = (username: string) => {
    const users = storage.getUsers();
    setIsLoggedIn(true);
    setCurrentUser(username);
    setUserData(users[username].data);
    storage.setSession(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserData(null);
    storage.clearSession();
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    if (!userData) return;
    const newTransaction: Transaction = { ...t, id: Date.now().toString() };
    setUserData({ ...userData, transactions: [...userData.transactions, newTransaction] });
  };

  const deleteTransaction = (id: string) => {
    if (!userData) return;
    setUserData({ ...userData, transactions: userData.transactions.filter(t => t.id !== id) });
  };

  // Categories (Types)
  const addCategory = (c: Omit<Category, 'id'>) => {
    if (!userData) return;
    const newCat = { ...c, id: Date.now().toString() };
    setUserData({ ...userData, categories: [...userData.categories, newCat] });
  };
  const deleteCategory = (id: string) => {
    if (!userData) return;
    setUserData({ ...userData, categories: userData.categories.filter(c => c.id !== id) });
  };
  const updateCategory = (id: string, name: string) => {
    if (!userData) return;
    setUserData({ ...userData, categories: userData.categories.map(c => c.id === id ? { ...c, name } : c) });
  };

  // Methods
  const addMethod = (m: Omit<Method, 'id'>) => {
    if (!userData) return;
    const newM = { ...m, id: Date.now().toString() };
    setUserData({ ...userData, methods: [...userData.methods, newM] });
  };
  const deleteMethod = (id: string) => {
    if (!userData) return;
    setUserData({ ...userData, methods: userData.methods.filter(m => m.id !== id) });
  };
  const updateMethod = (id: string, name: string) => {
    if (!userData) return;
    setUserData({ ...userData, methods: userData.methods.map(m => m.id === id ? { ...m, name } : m) });
  };

  // Accounts
  const addAccount = (a: Omit<Account, 'id'>) => {
    if (!userData) return;
    const newA = { ...a, id: Date.now().toString() };
    setUserData({ ...userData, accounts: [...userData.accounts, newA] });
  };
  const deleteAccount = (id: string) => {
    if (!userData) return;
    setUserData({ ...userData, accounts: userData.accounts.filter(a => a.id !== id) });
  };
  const updateAccount = (id: string, name: string) => {
    if (!userData) return;
    setUserData({ ...userData, accounts: userData.accounts.map(a => a.id === id ? { ...a, name } : a) });
  };

  // Savings
  const addSavingsGoal = (g: Omit<SavingsGoal, 'id' | 'order'>) => {
    if (!userData) return;
    const newGoal: SavingsGoal = { ...g, id: Date.now().toString(), order: userData.savings.length };
    setUserData({ ...userData, savings: [...userData.savings, newGoal] });
  };
  const updateSavingsGoal = (id: string, newAmount: number, transType: 'INCOME' | 'EXPENSE', amountChange: number) => {
    if (!userData) return;
    const goal = userData.savings.find(s => s.id === id);
    if (!goal) return;
    const savingsCategory = userData.categories.find(c => c.name === '저축' && c.type === transType) || userData.categories.find(c => c.type === transType);
    const defaultAccount = userData.accounts[0]?.id || 'a1';
    const defaultMethod = userData.methods[0]?.id || 'p1';

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transType,
      categoryId: savingsCategory?.id,
      accountId: defaultAccount,
      methodId: defaultMethod,
      amount: amountChange,
      date: new Date().toISOString(),
      memo: `${goal.purpose} (${transType === 'INCOME' ? '입금' : '출금'})`,
      savingsId: goal.id
    };
    setUserData({
      ...userData,
      savings: userData.savings.map(s => s.id === id ? { ...s, currentAmount: newAmount } : s),
      transactions: [...userData.transactions, newTransaction]
    });
  };
  const deleteSavingsGoal = (id: string) => {
    if (!userData) return;
    setUserData({ ...userData, savings: userData.savings.filter(s => s.id !== id), transactions: userData.transactions.filter(t => t.savingsId !== id) });
  };
  const reorderSavingsGoals = (newGoals: SavingsGoal[]) => {
    if (!userData) return;
    setUserData({ ...userData, savings: newGoals.map((g, idx) => ({ ...g, order: idx })) });
  };

  if (!isLoggedIn || !userData) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} username={userData.username}>
      {activeTab === 'dashboard' && <Dashboard transactions={userData.transactions} categories={userData.categories} accounts={userData.accounts} />}
      {activeTab === 'calendar' && <CalendarView transactions={userData.transactions} categories={userData.categories} />}
      {activeTab === 'income' && (
        <TransactionManager
          type="INCOME"
          transactions={userData.transactions}
          categories={userData.categories}
          methods={userData.methods}
          accounts={userData.accounts}
          onAddTransaction={addTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      )}
      {activeTab === 'expense' && (
        <TransactionManager
          type="EXPENSE"
          transactions={userData.transactions}
          categories={userData.categories}
          methods={userData.methods}
          accounts={userData.accounts}
          onAddTransaction={addTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      )}
      {activeTab === 'savings' && (
        <Savings 
          goals={userData.savings}
          transactions={userData.transactions}
          categories={userData.categories}
          onAddGoal={addSavingsGoal}
          onUpdateGoal={updateSavingsGoal}
          onDeleteGoal={deleteSavingsGoal}
          onReorderGoals={reorderSavingsGoals}
        />
      )}
      {activeTab === 'settings' && (
        <Settings 
          categories={userData.categories}
          methods={userData.methods}
          accounts={userData.accounts}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
          onAddMethod={addMethod}
          onUpdateMethod={updateMethod}
          onDeleteMethod={deleteMethod}
          onAddAccount={addAccount}
          onUpdateAccount={updateAccount}
          onDeleteAccount={deleteAccount}
        />
      )}
    </Layout>
  );
};

export default App;
