import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [values, setValues] = useState({
    email: "",
    password: ""
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for signup email in local storage on component mount
    const signupEmail = localStorage.getItem('signupEmail');
    if (signupEmail) {
      setValues(prev => ({ ...prev, email: signupEmail }));
      localStorage.removeItem('signupEmail'); // Remove it after setting
    }
  }, []);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAll = () => {
    const newErrors = {};
    
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!values.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsValidating(true);
    
    const isValid = validateAll();
    if (!isValid) {
      setIsValidating(false);
      setToast({
        message: 'Please fix the errors above.',
        type: 'error',
        visible: true,
      });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userId = userCred.user.uid;

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role || "resident";
        
        setToast({
          message: 'Login successful!',
          type: 'success',
          visible: true,
        });

        // Redirect based on user role after a short delay
        setTimeout(() => {
          if (role === "admin") {
            navigate("/adminpanel");
          } else {
            navigate("/dashboard");
          }
        }, 1500);
      } else {
        // If user document doesn't exist, create it with default role and redirect to UserDashboard
        await setDoc(userRef, {
          email: values.email,
          totalPoints: 0,
          role: "resident",
        });
        
        setToast({
          message: 'Login successful!',
          type: 'success',
          visible: true,
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setToast({
        message: 'Login failed. Please check your credentials.',
        type: 'error',
        visible: true,
      });
      setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
    }
    
    setIsValidating(false);
  };

  const handleGoogleAuth = () => {
    setToast({ 
      message: 'Redirecting to Google...', 
      type: 'info', 
      visible: true 
    });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const renderError = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <span className="text-red-500">✕</span>
        {errors[field]}
      </p>
    ) : null;

  const inputClasses = (field) => `
    mt-1 block w-full px-4 py-3 pr-10 border-2 rounded-xl transition-all duration-200
    focus:outline-none focus:ring-0 placeholder-gray-400
    ${touched[field] && errors[field] 
      ? 'border-red-300 focus:border-red-500 bg-red-50' 
      : 'border-gray-200 focus:border-emerald-500 hover:border-gray-300'
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Header */}
      <header className="absolute top-4 left-4 font-bold text-lg text-emerald-800">
        T. Alonzo Project
      </header>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <span className="text-2xl text-emerald-600">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Google Button */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">
              Sign in with Google
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={inputClasses('email')}
                  placeholder="Enter your email"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">📧</span>
              </div>
              {renderError('email')}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={inputClasses('password')}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {renderError('password')}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => {/* Handle forgot password */}}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isValidating}
              className="w-full py-3 px-4 text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isValidating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate("/signup")}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          For support: taonzo@gmail.com
        </div>
      </div>

      {/* Toast Notifications */}
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
}