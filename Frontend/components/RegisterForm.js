'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; 
import { register } from '../services/apiService';
import { toast } from 'react-hot-toast';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const router = useRouter(); 
  const { login } = useAuth(); // <--- Get login function
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordValidity, setPasswordValidity] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidity({
      hasLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[@$!%*?&]/.test(newPassword),
    });
  };

  // <--- GOOGLE HANDLER --->
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the token to your backend
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      // Log the user in directly
      login(res.data.user, res.data.token);
      toast.success(`Account created! Welcome, ${res.data.user.firstName}.`);
      
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (err) {
      console.error('Google Signup Error:', err);
      toast.error('Google signup failed.');
    }
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match!");
    }

    setLoading(true);
    const toastId = toast.loading('Creating account...');

    try {
      const { firstName, lastName, email, password } = formData;
      const res = await register({ firstName, lastName, email, password });
      
      // Auto-login after register
      login(res.data.user, res.data.token);
      
      toast.success("Account created successfully!", { id: toastId });
      setTimeout(() => router.push('/'), 1500);

    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder }) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
        required
      />
    </div>
  );

  return (
    <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/40 animate-fade-in max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join Archivia</h2>
        <p className="text-gray-500 mt-2">Create your academic profile today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="First Name" name="firstName" placeholder="Jane" />
          <InputField label="Last Name" name="lastName" placeholder="Doe" />
        </div>

        <InputField label="Email Address" name="email" type="email" placeholder="jane.doe@university.edu" />
        <InputField label="Password" name="password" type="password" placeholder="••••••••" />
        <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Profile...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}