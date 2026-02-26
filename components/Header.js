"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Download, Plus, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({
  onDownload,
  onDownloadPDF,
  slides,
  activeSlide,
  setActiveSlide,
  onAddSlide,
  user,
  profile,
  onLogout,
  isPremium,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Slide limit based on plan
  const slideLimit = isPremium ? 15 : 10;

  // ✅ Avatar logic
  const avatarSrc =
    profile?.avatar_url && profile.avatar_url.trim() !== ""
      ? profile.avatar_url
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          profile?.full_name || user?.email || "User"
        )}&background=16a34a&color=ffffff&size=128`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Safe slide add handler
  const handleAddSlide = () => {
    if (slides.length >= slideLimit) {
      if (!isPremium) {
        alert("Free plan allows only 10 slides. Upgrade to Premium for 20 slides.");
        router.push("/upgrade");
      }
      return;
    }

    onAddSlide();
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        backgroundColor: "#f4f7f4",
        zIndex: 50,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              padding: "4px",
            }}
          >
            <Image
              src="/icon.png"
              alt="Logo"
              width={40}
              height={40}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <span
            style={{
              color: "#01823b",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            ManoRekha Whiteboard
          </span>
        </div>

        {/* SLIDES */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(index)}
              style={{
                minWidth: "36px",
                height: "36px",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor:
                  index === activeSlide ? "#15803d" : "#ffffff",
                color:
                  index === activeSlide ? "#ffffff" : "#16a34a",
                border:
                  index === activeSlide
                    ? "none"
                    : "1px solid #d1d5db",
              }}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={handleAddSlide}
            disabled={slides.length >= slideLimit}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                slides.length >= slideLimit ? "#e5e7eb" : "#16a34a",
              color: "#ffffff",
              cursor:
                slides.length >= slideLimit ? "not-allowed" : "pointer",
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!isPremium && (
            <button
              onClick={() => router.push("/upgrade")}
              style={{
                backgroundColor: "#15803d",
                color: "#ffffff",
                padding: "6px 16px",
                borderRadius: "20px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Upgrade
            </button>
          )}

          {/* PNG */}
          <button
            onClick={onDownload}
            style={{
              backgroundColor: "#ffffff",
              color: "#16a34a",
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: 600,
              border: "1px solid #d1d5db",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Download size={18} />
            PNG
          </button>

          {/* PDF */}
          <button
            onClick={() => {
              if (!isPremium) {
                router.push("/upgrade");
              } else {
                onDownloadPDF();
              }
            }}
            style={{
              backgroundColor:
                isPremium ? "#ffffff" : "#e5e7eb",
              color:
                isPremium ? "#16a34a" : "#6b7280",
              padding: "6px 16px",
              borderRadius: "20px",
              fontWeight: 600,
              border: "1px solid #d1d5db",
              cursor:
                isPremium ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Download size={18} />
            PDF
          </button>

          {/* USER DROPDOWN */}
          <div
            ref={dropdownRef}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
            onClick={() => setOpen(!open)}
          >
            {/* ✅ FIXED AVATAR STYLE */}
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #16a34a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              <Image
                src={avatarSrc}
                alt="User Avatar"
                width={38}
                height={38}
                unoptimized
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>

            <ChevronDown size={16} />

            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "52px",
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                  padding: "12px",
                  minWidth: "220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    padding: "6px 10px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    color: "#374151",
                  }}
                >
                  {profile?.full_name || "User"}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    padding: "0 10px 6px",
                    color: "#6b7280",
                  }}
                >
                  {user?.email || "No email"}
                </div>

                <button
                  onClick={() => router.push("/profile")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Profile
                </button>

                <button
                  onClick={onLogout}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#dc2626",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}