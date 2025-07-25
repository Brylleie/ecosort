import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const [values, setValues] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateAll = useCallback(() => {
    const newErrors = {};

    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!values.username) {
      newErrors.username = 'Username is required';
    } else if (values.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 'none', score: 0 };

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { strength: 'weak', score, checks };
    if (score <= 3) return { strength: 'medium', score, checks };
    if (score <= 4) return { strength: 'strong', score, checks };
    return { strength: 'very-strong', score, checks };
  };

  const passwordAnalysis = getPasswordStrength(values.password);

  const handleSubmit = async () => {
    setIsValidating(true);
    const isValid = validateAll();

    if (!isValid) {
      setToast({ message: 'Please fix the errors above.', type: 'error', visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
      setIsValidating(false);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const userId = userCred.user.uid;

      await setDoc(doc(db, "users", userId), {
        email: values.email,
        username: values.username,
        totalPoints: 0,
        role: "resident"
      });

      setToast({ message: 'Account created successfully!', type: 'success', visible: true });
      localStorage.setItem('signupEmail', values.email);

      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error(error);
      setToast({ message: error.message || 'Signup failed.', type: 'error', visible: true });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
    }

    setIsValidating(false);
  };

  const inputClasses = (field) => `
    mt-1 block w-full px-4 py-3 pr-10 border-2 rounded-xl transition-all duration-200
    focus:outline-none focus:ring-0 placeholder-gray-400
    ${touched[field] && errors[field]
      ? 'border-red-300 focus:border-red-500 bg-red-50'
      : 'border-gray-200 focus:border-emerald-500 hover:border-gray-300'}
  `;

  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <span className="text-red-500">✕</span>
        {errors[field]}
      </p>
    ) : null;

  const renderPasswordStrength = () => {
    if (!values.password) return null;

    const colors = {
      none: 'bg-gray-300',
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-blue-500',
      'very-strong': 'bg-green-500'
    };

    return (
      <div className="mt-2 space-y-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                level <= passwordAnalysis.score
                  ? colors[passwordAnalysis.strength]
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs font-medium ${
          passwordAnalysis.strength === 'weak' ? 'text-red-500' :
          passwordAnalysis.strength === 'medium' ? 'text-yellow-600' :
          passwordAnalysis.strength === 'strong' ? 'text-blue-600' :
          passwordAnalysis.strength === 'very-strong' ? 'text-green-600' :
          'text-gray-500'
        }`}>
          Password strength: {passwordAnalysis.strength.replace('-', ' ')}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {Object.entries({
            '8+ characters': passwordAnalysis.checks?.length,
            'Uppercase letter': passwordAnalysis.checks?.uppercase,
            'Lowercase letter': passwordAnalysis.checks?.lowercase,
            'Number': passwordAnalysis.checks?.numbers,
            'Special character': passwordAnalysis.checks?.special
          }).map(([label, met]) => (
            <div key={label} className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-gray-400'}`}>
              <span>{met ? '✓' : '✕'}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <span className="text-2xl text-emerald-600">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join us and start your journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
            <div className="relative">
              <input
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={inputClasses('email')}
                placeholder="Enter your email"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">📧</span>
            </div>
            {renderError('email')}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                value={values.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                className={inputClasses('username')}
                placeholder="Choose a username"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">👤</span>
            </div>
            {renderError('username')}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={inputClasses('password')}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {renderPasswordStrength()}
            {renderError('password')}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                className={inputClasses('confirmPassword')}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {renderError('confirmPassword')}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isValidating}
            className="w-full py-3 px-4 text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isValidating ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate("/login")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-xl text-white shadow-lg transition-all duration-300 z-50 ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <span className="text-green-100">✓</span>}
            {toast.type === 'error' && <span className="text-red-100">✕</span>}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
