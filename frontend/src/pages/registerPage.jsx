
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleRegister() {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    api.post("/auth/register", {
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: password,
    })
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
        setError(
          err.response?.data?.message || "Registration failed"
        );
      });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-blue-900">
          Hospital Management System
        </h1>

        <h2 className="mt-4 text-xl font-semibold text-gray-700">
          Create Account
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Register as a receptionist
        </p>

        <label className="mt-5 w-full font-medium text-gray-700">
          Email
        </label>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
          placeholder="user@gmail.com"
        />

        <div className="mt-4 flex w-full gap-3">
          <div className="flex w-1/2 flex-col">
            <label className="font-medium text-gray-700">
              First Name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
              placeholder="First name"
            />
          </div>

          <div className="flex w-1/2 flex-col">
            <label className="font-medium text-gray-700">
              Last Name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
              placeholder="Last name"
            />
          </div>
        </div>

        <label className="mt-4 w-full font-medium text-gray-700">
          Password
        </label>

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
          placeholder="Minimum 8 characters"
        />

        <label className="mt-4 w-full font-medium text-gray-700">
          Confirm Password
        </label>

        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-blue-500"
          placeholder="Confirm password"
        />

        {error && (
          <p className="mt-3 w-full text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleRegister}
          className="mt-6 h-11 w-full rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-700"
        >
          Register
        </button>

        <p className="mt-4 w-full text-right text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
