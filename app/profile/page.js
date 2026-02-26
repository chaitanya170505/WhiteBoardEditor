"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    setUser(user);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(profileError);
      alert("Failed to fetch profile. Check RLS or network.");
      return;
    }

    setProfile(profileData);
    setFullName(profileData?.full_name || "");
  }

  async function updateProfile() {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: fullName });
      alert("Profile updated!");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true);

      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      alert("Profile picture updated!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error uploading avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteAccount() {
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action is permanent!"
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      if (profile.avatar_url) {
        const avatarPath = profile.avatar_url.split("/avatars/")[1];
        if (avatarPath) {
          await supabase.storage.from("avatars").remove([avatarPath]);
        }
      }

      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!data.success)
        throw new Error(data.error || "Failed to delete account");

      alert("Your account has been deleted successfully.");
      router.push("/signup");
    } catch (error) {
      console.error(error);
      alert("Failed to delete account. " + error.message);
    } finally {
      setDeleting(false);
    }
  }

  if (!profile)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Loading...
      </div>
    );

  const avatarSrc =
    profile?.avatar_url && profile.avatar_url.trim() !== ""
      ? profile.avatar_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile?.full_name || user?.email || "User"
        )}&background=16a34a&color=ffffff&size=128`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#e8fef0",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        }}
      >
        {/* Back to Home */}
        <button
          onClick={() => router.push("/")}
          style={{
            marginBottom: "25px",
            padding: "8px 18px",
            background: "transparent",
            border: "1px solid #16a34a",
            color: "#16a34a",
            borderRadius: "20px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar (FIXED) */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #16a34a",
                backgroundColor: "#f3f4f6",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              }}
            >
              <Image
                src={avatarSrc}
                alt="Avatar"
                width={140}
                height={140}
                unoptimized
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>

            <label
              style={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                background: "#16a34a",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
              }}
            >
              {uploading ? "..." : "Edit"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "26px",
                marginBottom: "6px",
                fontWeight: 700,
              }}
            >
              {profile.full_name || "No Name"}
            </h2>

            <p style={{ color: "#6b7280", marginBottom: "12px" }}>
              {user?.email}
            </p>

            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor:
                  profile.plan === "premium" ? "#15803d" : "#e5e7eb",
                color:
                  profile.plan === "premium" ? "#fff" : "#374151",
              }}
            >
              {profile.plan === "premium"
                ? "Premium Plan"
                : "Free Plan"}
            </span>
          </div>
        </div>

        <hr
          style={{
            margin: "40px 0",
            borderTop: "1px solid #e5e7eb",
          }}
        />

        {/* ACCOUNT DETAILS */}
        <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>
          Account Details
        </h3>

        <div style={{ display: "grid", gap: "20px" }}>
          <div>
            <label
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={{
                marginTop: "6px",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                width: "100%",
                outline: "none",
              }}
            />

            <button
              onClick={updateProfile}
              disabled={saving}
              style={{
                marginTop: "10px",
                padding: "10px 24px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div>
            <label
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              Email
            </label>

            <div
              style={{
                marginTop: "6px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "12px",
                color: "#374151",
              }}
            >
              {user?.email}
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              Current Plan
            </label>

            <div
              style={{
                marginTop: "6px",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "12px",
                color: "#374151",
              }}
            >
              {profile.plan === "premium"
                ? "Premium (Upto 15 Slides & PDF Export)"
                : "Free (Max 15 Slides, No PDF Export)"}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <button
              onClick={deleteAccount}
              disabled={deleting}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#dc2626",
                border: "1px solid #fca5a5",
                borderRadius: "20px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}