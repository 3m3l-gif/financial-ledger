
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  username: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, username }) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <i className="fas fa-wallet text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">가계부</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem 
            icon="fas fa-chart-line" 
            label="대시보드" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon="fas fa-calendar-alt" 
            label="달력 보기" 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
          />
          <NavItem 
            icon="fas fa-plus-circle" 
            label="수입 내역" 
            active={activeTab === 'income'} 
            onClick={() => setActiveTab('income')} 
          />
          <NavItem 
            icon="fas fa-minus-circle" 
            label="지출 내역" 
            active={activeTab === 'expense'} 
            onClick={() => setActiveTab('expense')} 
          />
          <NavItem 
            icon="fas fa-piggy-bank" 
            label="저축 목표" 
            active={activeTab === 'savings'} 
            onClick={() => setActiveTab('savings')} 
          />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem 
              icon="fas fa-cog" 
              label="분류 관리" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200">
              {username[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{username}님</p>
              <p className="text-[10px] text-slate-400 font-medium">BASIC USER</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="font-semibold">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative">
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative group ${
      active 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    {active && <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"></div>}
    <i className={`${icon} w-5 text-lg ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}></i>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default Layout;
