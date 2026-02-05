"use client";

import React, { useState } from "react";
import { authClient } from "../../lib/auth-client"; 
import { toast } from "../../lib/toast";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      image: "", // Use empty string instead of null
    }, {
      onError: (ctx) => {
        setLoading(false);
        // This will alert exactly what the 422 error is (e.g. "Email already exists")
        toast.error(ctx.error.message || "Signup failed");
      },
      onSuccess: () => {
        setLoading(false);
        toast.success("Welcome!");
        window.location.href = "/dashboard";
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded text-black"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded text-black"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded text-black"
        required
        minLength={8}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};