import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Mail, Lock } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-bg-primary items-center justify-center p-6">
      <div className="glass w-full max-w-md p-8 flex flex-col items-center animate-fade-in">
        <div className="bg-accent-blue p-4 rounded-2xl mb-6 shadow-lg shadow-accent-blue/20">
          <LayoutDashboard size={32} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-text-secondary mb-8 text-center text-sm">
          Enter your credentials to access your trading portal
        </p>

        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button onClick={handleLogin} className="primary w-full !py-3 mt-4 text-lg">
            Sign In
          </button>
        </div>

        <p className="mt-8 text-sm text-text-secondary">
          Don't have an account? <Link to="/register" className="text-accent-blue hover:underline font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
