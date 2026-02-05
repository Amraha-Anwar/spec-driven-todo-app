"use client";

import { useState, useEffect } from "react";
import { authClient } from "../../../lib/auth-client";
import { Avatar } from "../../../components/ui/avatar";
import { toast } from "../../../lib/toast";
import { User, Mail, Save } from "lucide-react";

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data);
      setName(data?.user?.name || "");
    };
    getSession();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authClient.updateUser({ name });
      const { data } = await authClient.getSession();
      setSession(data);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (file: File) => {
    toast.info("Avatar upload feature coming soon!");
    console.log("Selected file:", file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold glow-text mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glassmorphic rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-6">Profile</h2>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar
              name={session?.user?.name || "User"}
              imageUrl={session?.user?.image}
              size="lg"
              editable
              onImageChange={handleAvatarChange}
            />
            <div>
              <p className="font-medium mb-1">Profile Picture</p>
              <p className="text-sm text-gray-400">Click on avatar to upload new image</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glassmorphic rounded-lg border border-white/10 focus:border-pink-red/50 focus:ring-2 focus:ring-pink-red/20 outline-none transition-all"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-3 glassmorphic rounded-lg border border-white/10 opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-pink-red to-pink-red/80 rounded-lg font-medium flex items-center gap-2 glow-effect hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="glassmorphic rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-6">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive task reminders via email</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
              <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-400">Always enabled for premium experience</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-pink-red">
              <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}