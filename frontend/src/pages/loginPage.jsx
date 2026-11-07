
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin() {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    api.post("/auth/login", {
      email: email,
      password: password,
    })
      .then((res) => {
        toast.success("Login successful");

        // Store JWT token
        localStorage.setItem("token", res.data.token);

        // Store logged-in user
        localStorage.setItem("user", JSON.stringify(res.data.user));

        console.log("Logged User:", res.data.user);

        // Navigate according to user role
        const role = res.data.user.role;

        if (role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else if (role === "RECEPTIONIST") {
          navigate("/receptionist", { replace: true });
        } else if (role === "DOCTOR") {
          navigate("/doctor", { replace: true });
        } else {
          toast.error("Invalid user role");
        }
      })
      .catch((err) => {
        console.log(err);

        toast.error(
          err.response?.data?.message || "Login failed"
        );
      });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-blue-900">
          Hospital Management System
        </h1>

        <h2 className="mt-5 text-xl font-semibold text-gray-700">
          Login
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Sign in to your account
        </p>

        <label className="mt-6 w-full font-medium text-gray-700">
          Email
        </label>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
          placeholder="user@gmail.com"
        />

        <label className="mt-5 w-full font-medium text-gray-700">
          Password
        </label>

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
          placeholder="Enter your password"
        />

        <button
          onClick={handleLogin}
          className="mt-6 h-11 w-full rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>

        <p className="mt-5 w-full text-right text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600"
          >
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}
