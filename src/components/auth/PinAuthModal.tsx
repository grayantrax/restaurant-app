import React, { useState, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import {
  Lock,
  Delete,
  X,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const PinAuthModal: React.FC = () => {
  const {
    currentUser,
    loginWithPin,
    adminEmergencyLogin,
    isPinLockOpen,
    closePinLock
  } = usePos();

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Recovery form states
  const [recoveryEmailOrPhone, setRecoveryEmailOrPhone] = useState('');
  const [recoverySecurityKey, setRecoverySecurityKey] = useState('');
  const [newMasterPin, setNewMasterPin] = useState('');
  const [confirmNewMasterPin, setConfirmNewMasterPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false);

  const verifyPin = (pin: string) => {
    const success = loginWithPin(pin);
    if (!success) {
      setErrorMsg('Invalid PIN code. Please try again.');
      setEnteredPin('');
    } else {
      setEnteredPin('');
      setErrorMsg('');
    }
  };

  const handleDigitPress = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setErrorMsg('');

      // Auto submit on 4th digit
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setEnteredPin('');
    setErrorMsg('');
  };

  // Keyboard support for numeric PIN entry
  useEffect(() => {
    if ((!isPinLockOpen && currentUser) || isRecoveryMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinLockOpen, currentUser, enteredPin, isRecoveryMode]);

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess('');

    if (!recoveryEmailOrPhone.trim()) {
      setRecoveryError('Please provide the Admin email or phone number.');
      return;
    }
    if (!recoverySecurityKey.trim()) {
      setRecoveryError('Please provide the registered phone or recovery key.');
      return;
    }

    if (newMasterPin || confirmNewMasterPin) {
      if (!/^\d{4}$/.test(newMasterPin)) {
        setRecoveryError('The new PIN must be exactly 4 numeric digits.');
        return;
      }
      if (newMasterPin !== confirmNewMasterPin) {
        setRecoveryError('PIN confirmation does not match.');
        return;
      }
    }

    setIsSubmittingRecovery(true);

    const result = adminEmergencyLogin({
      emailOrPhone: recoveryEmailOrPhone.trim(),
      securityKey: recoverySecurityKey.trim(),
      newPin: newMasterPin ? newMasterPin : undefined,
    });

    setIsSubmittingRecovery(false);

    if (result.success) {
      setRecoverySuccess(result.message);
      setTimeout(() => {
        setIsRecoveryMode(false);
        setRecoveryEmailOrPhone('');
        setRecoverySecurityKey('');
        setNewMasterPin('');
        setConfirmNewMasterPin('');
        setRecoverySuccess('');
      }, 1200);
    } else {
      setRecoveryError(result.message);
    }
  };

  if (!isPinLockOpen && currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Dismiss lock button if user is already logged in */}
        {currentUser && isPinLockOpen && (
          <button
            onClick={closePinLock}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
            title="Dismiss lock"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-750 text-center">
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-inner">
            {isRecoveryMode ? <ShieldCheck className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            JOJO FOODIES
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {isRecoveryMode ? 'Admin Alternative Login & PIN Reset' : 'POS Security & Access Terminal'}
          </p>
        </div>

        {!isRecoveryMode ? (
          /* Standard PIN Entry Area */
          <div className="p-6 space-y-5">
            {/* PIN Display Dots */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-medium text-slate-400 mb-3">
                Enter your 4-digit security PIN
              </div>
              <div className="flex items-center gap-3">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = enteredPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all border ${
                        isFilled
                          ? 'bg-amber-400 border-amber-400 scale-110 shadow-lg shadow-amber-400/50'
                          : 'bg-slate-800 border-slate-600'
                      }`}
                    />
                  );
                })}
              </div>

              {errorMsg && (
                <div className="mt-3 text-xs text-rose-400 font-semibold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 animate-pulse">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitPress(digit)}
                  className="h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-xl font-bold text-slate-100 transition-all shadow-md active:scale-95 flex items-center justify-center border border-slate-700/60 cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigitPress('0')}
                className="h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-xl font-bold text-slate-100 transition-all shadow-md active:scale-95 flex items-center justify-center border border-slate-700/60 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Alternative Admin Login Trigger */}
            <div className="pt-3 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(true);
                  setErrorMsg('');
                  setRecoveryError('');
                  setRecoverySuccess('');
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors py-1.5 px-3 rounded-xl hover:bg-amber-400/10 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Forgot Master PIN? Alternative Login</span>
              </button>
            </div>
          </div>
        ) : (
          /* Alternative Admin Recovery Login Form */
          <form onSubmit={handleRecoverySubmit} className="p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Emergency Admin Recovery</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verify registered Admin details to unlock the POS and reset your master PIN.
              </p>
            </div>

            {recoveryError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{recoveryError}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Admin Email, Name, or Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={recoveryEmailOrPhone}
                    onChange={(e) => setRecoveryEmailOrPhone(e.target.value)}
                    placeholder="e.g. sarah.owner@kampalabistro.ug"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Phone or Recovery Key
                  </label>
                  <span className="text-[10px] text-slate-500">Key or +256...</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={recoverySecurityKey}
                    onChange={(e) => setRecoverySecurityKey(e.target.value)}
                    placeholder="Registered Phone or Recovery Key"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-amber-300">
                    Set New Master PIN (4 Digits)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    {showNewPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showNewPin ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={4}
                    value={newMasterPin}
                    onChange={(e) => setNewMasterPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="New PIN (••••)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-center font-mono tracking-widest text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    maxLength={4}
                    value={confirmNewMasterPin}
                    onChange={(e) => setConfirmNewMasterPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm PIN"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-center font-mono tracking-widest text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmittingRecovery}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmittingRecovery ? 'Verifying...' : 'Verify & Unlock POS'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(false);
                  setRecoveryError('');
                }}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to PIN Keypad</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
