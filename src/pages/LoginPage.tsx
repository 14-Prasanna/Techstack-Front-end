import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"login" | "otp" | "forget" | "reset">("login");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://localhost:8080/api/auth",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  const login = async () => {
    try {
      const response = await api.post("/login", { email, password });
      console.log("Login response:", response.data);
      setStep("otp");
      setError(null);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data || error.message || "Login failed");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await api.post("/login/verify", { email, otpCode: otp });
      console.log("Verify OTP response:", response.data);
      const token = response.data; // Token is returned directly
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", email);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        navigate("/");
      } else {
        throw new Error("No token received from server");
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error("Verify OTP error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data || "OTP verification failed");
    }
  };

  const resendOtp = async () => {
    try {
      console.log("Resend OTP request:", { email });
      await api.post("/resend-otp", null, { params: { email } });
      setError(null);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Resend OTP error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data || "Failed to resend OTP");
    }
  };

  const forgetPassword = async () => {
    try {
      console.log("Forget password request:", { email });
      const response = await api.post("/forget-password", null, { params: { email } });
      setStep("reset");
      setError(null);
      // Optional: Show success message (e.g., "OTP sent to your email")
    } catch (err) {
      const error = err as AxiosError;
      console.error("Forget password error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data || "Failed to send reset OTP");
    }
  };

  const resetPassword = async () => {
    try {
      console.log("Reset password request:", { email, otp, newPassword });
      const response = await api.post("/reset-password", { email, otpCode: otp, newPassword });
      setStep("login");
      setError(null);
      // Optional: Show success message (e.g., "Password reset successfully")
    } catch (err) {
      const error = err as AxiosError;
      console.error("Reset password error:", error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {step === "login" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
            />
            <Button onClick={login} className="w-full mb-2">Login</Button>
            <Button variant="link" onClick={() => setStep("forget")}>Forget Password?</Button>
            <Button variant="link" onClick={() => navigate("/signup")}>Signup</Button>
          </>
        )}
        {step === "otp" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-4"
            />
            <Button onClick={verifyOtp} className="w-full mb-2">Verify OTP</Button>
            <Button variant="link" onClick={resendOtp}>Resend OTP</Button>
          </>
        )}
        {step === "forget" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Forget Password</h2>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <Button onClick={forgetPassword} className="w-full mb-2">Send OTP</Button>
            <Button variant="link" onClick={() => setStep("login")}>Back to Login</Button>
          </>
        )}
        {step === "reset" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mb-4"
            />
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-4"
            />
            <Button onClick={resetPassword} className="w-full mb-2">Reset Password</Button>
            <Button variant="link" onClick={() => setStep("login")}>Back to Login</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;