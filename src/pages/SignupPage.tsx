import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://localhost:8080/api/auth", 
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

  const signup = async () => {
    try {
      console.log("Signup request payload:", { name, email, password });
      const response = await api.post("/signup", { name, email, password });
      console.log("Signup response:", response.data);
      setStep("otp");
      setError(null);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Signup error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setError(error.response?.data?.message || error.response?.data || error.message || "Signup failed");
    }
  };

  const verifyOtp = async () => {
    try {
      console.log("Verify OTP request payload:", { email, otpCode: otp });
      const response = await api.post("/signup/verify", { email, otpCode: otp });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {step === "signup" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Signup</h2>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4"
            />
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
            <Button onClick={signup} className="w-full mb-2">Signup</Button>
            <Button variant="link" onClick={() => navigate("/login")}>Already have an account? Login</Button>
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
      </div>
    </div>
  );
};

export default SignupPage;