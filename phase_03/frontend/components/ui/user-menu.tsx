import React from "react";
import { useRouter } from "next/navigation";
import { logout } from "../../lib/auth-actions";
import { useAuth } from "../../app/hooks/use-auth";

export const UserMenu = () => {
  const { data } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (!data?.user) return null;

  return (
    <div className="flex items-center gap-4">
      <span className="font-medium">{data.user.name}</span>
      <button
        onClick={handleLogout}
        className="text-red-500 hover:text-red-600 text-sm"
      >
        Logout
      </button>
    </div>
  );
};