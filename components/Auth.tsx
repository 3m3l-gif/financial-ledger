
import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../utils/storage';

interface AuthProps {
  onLogin: (username: string) => void;
}

type AuthView = 'LOGIN' | 'SIGNUP' | 'PIN_SETUP' | 'PIN_LOGIN';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const autoLoginUsername = storage.getAutoLoginUser();

  useEffect(() => {
    if (autoLoginUsername) {
      const users = storage.getUsers();
      if (users[autoLoginUsername]?.pin) {
        setView('PIN_LOGIN');
        setUsername(autoLoginUsername);
      }
    }
  }, [autoLoginUsername]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    const success = storage.saveUser(username, password);
    if (success) {
      setSuccessMsg('회원가입 완료! 로그인을 진행해주세요.');
      setView('LOGIN');
      setPassword('');
    } else {
      setError('이미 존재하는 아이디입니다.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const userData = storage.verifyUser(username, password);
    if (userData) {
      if (autoLogin) {
        const users = storage.getUsers();
        if (!users[username].pin) {
          setView('PIN_SETUP');
        } else {
          storage.setAutoLoginUser(username);
          onLogin(username);
        }
      } else {
        storage.setAutoLoginUser(null);
        onLogin(username);
      }
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handlePinSetup = () => {
    const pinStr = pin.join('');
    if (pinStr.length < 4) {
      setError('4자리 번호를 모두 입력해주세요.');
      return;
    }
    storage.setUserPin(username, pinStr);
    storage.setAutoLoginUser(username);
    onLogin(username);
  };

  const handlePinLogin = () => {
    const pinStr = pin.join('');
    const userData = storage.verifyPin(username, pinStr);
    if (userData) {
      onLogin(username);
    } else {
      setError('인증번호가 틀렸습니다.');
      setPin(['', '', '', '']);
      pinRefs[0].current?.focus();
    }
  };

  const renderPinInput = () => (
    <div className="flex justify-center gap-4 my-10">
      {pin.map((digit, idx) => (
        <input
          key={idx}
          ref={pinRefs[idx]}
          type="password"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(idx, e.target.value)}
          onKeyDown={(e) => handlePinKeyDown(idx, e)}
          className="w-14 h-18 text-center text-3xl font-black border-2 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all bg-slate-50/50"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl"></div>

      <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-blue-100/50 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 border border-white z-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-[1.75rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-blue-200">
            <i className="fas fa-wallet"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">가계부</h1>
          <p className="text-slate-400 mt-2 font-bold tracking-widest text-[10px] uppercase">Smart Wealth Management</p>
        </div>

        {successMsg && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-2xl text-center font-black animate-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}

        {view === 'LOGIN' || view === 'SIGNUP' ? (
          <form onSubmit={view === 'LOGIN' ? handleLogin : handleSignup} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="아이디"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="비밀번호"
              />
            </div>

            {view === 'LOGIN' && (
              <div className="flex items-center gap-3 ml-1">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="autoLogin"
                    checked={autoLogin}
                    onChange={(e) => setAutoLogin(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-slate-200 rounded-lg focus:ring-blue-500 transition-all cursor-pointer"
                  />
                </div>
                <label htmlFor="autoLogin" className="text-sm text-slate-500 font-bold cursor-pointer select-none">자동 로그인 활성화</label>
              </div>
            )}

            {error && <p className="text-rose-500 text-xs font-black text-center animate-pulse">{error}</p>}

            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
              {view === 'LOGIN' ? '로그인하기' : '가입 완료'}
            </button>
            
            <button
              type="button"
              onClick={() => { setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setSuccessMsg(''); setError(''); }}
              className="w-full text-blue-600 text-[11px] font-black uppercase tracking-widest hover:underline"
            >
              {view === 'LOGIN' ? 'Create New Account' : 'Back to Login'}
            </button>
          </form>
        ) : view === 'PIN_SETUP' ? (
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">퀵 로그인 설정</h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">다음 접속부터 사용할 4자리 번호를 정해주세요.</p>
            {renderPinInput()}
            {error && <p className="text-rose-500 text-xs font-black mb-6">{error}</p>}
            <button onClick={handlePinSetup} className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
              설정 완료
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">{username}님, 어서오세요!</h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">인증번호 4자리를 입력하세요.</p>
            {renderPinInput()}
            {error && <p className="text-rose-500 text-xs font-black mb-6">{error}</p>}
            <div className="flex flex-col gap-5">
              <button onClick={handlePinLogin} className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                로그인
              </button>
              <button
                onClick={() => { setView('LOGIN'); storage.setAutoLoginUser(null); setPin(['', '', '', '']); setError(''); }}
                className="text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                Sign in with another account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
