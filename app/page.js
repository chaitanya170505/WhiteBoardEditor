"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import Header from "@/components/Header";
import Toolbar from "@/components/Toolbar";
import jsPDF from "jspdf";

const Whiteboard = dynamic(() => import("@/components/Whiteboard"), {
  ssr: false,
});

export default function WhiteboardApp() {
  const whiteboardRef = useRef(null);
  const hideTimer = useRef(null);
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Added profile state
  const [plan, setPlan] = useState("free");

  const [slides, setSlides] = useState([
    {
      id: Date.now(),
      shapes: [],
      undoStack: [],
      redoStack: [],
      bg: "#ffffff",
    },
  ]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#166534");
  const [width, setWidth] = useState(3);
  const [showToolbar, setShowToolbar] = useState(false);

  const currentSlide = slides[activeSlide];
  const isPremium = plan === "premium";

  /* -------------------- Fetch User & Profile -------------------- */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);

        // ✅ Updated to fetch all profile fields (*) including avatar_url
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*") 
          .eq("id", data.user.id)
          .single();

        if (profileData) {
          setProfile(profileData); // Store full profile for the Header
          setPlan(profileData.plan || "free");
        }
      }
    };

    getUser();
  }, [router]);

  /* -------------------- Logout -------------------- */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  /* -------------------- Whiteboard Helpers -------------------- */
  const updateShapes = (newShapes) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[activeSlide] = {
        ...updated[activeSlide],
        shapes: [...newShapes],
      };
      return updated;
    });
  };

  const pushUndo = () => {
    setSlides((prev) => {
      const updated = [...prev];
      const slide = { ...updated[activeSlide] };

      slide.undoStack = slide.undoStack || [];
      slide.redoStack = [];
      slide.undoStack.push(JSON.parse(JSON.stringify(slide.shapes)));

      updated[activeSlide] = slide;
      return updated;
    });
  };

  const handleUndo = () => {
    setSlides((prev) => {
      const updated = [...prev];
      const slide = { ...updated[activeSlide] };

      if (!slide.undoStack?.length) return prev;

      slide.redoStack = slide.redoStack || [];
      slide.redoStack.push(JSON.parse(JSON.stringify(slide.shapes)));
      slide.shapes = slide.undoStack.pop();

      updated[activeSlide] = slide;
      return updated;
    });
  };

  const handleRedo = () => {
    setSlides((prev) => {
      const updated = [...prev];
      const slide = { ...updated[activeSlide] };

      if (!slide.redoStack?.length) return prev;

      slide.undoStack = slide.undoStack || [];
      slide.undoStack.push(JSON.parse(JSON.stringify(slide.shapes)));
      slide.shapes = slide.redoStack.pop();

      updated[activeSlide] = slide;
      return updated;
    });
  };

  const handleAddSlide = () => {
    if (slides.length >= 15) {
      alert("Maximum of 15 slides allowed");
      return;
    }

    setSlides((prev) => [
      ...prev,
      {
        id: Date.now(),
        shapes: [],
        undoStack: [],
        redoStack: [],
        bg: "#ffffff",
      },
    ]);

    setActiveSlide(slides.length);
  };

  /* -------------------- PNG Download -------------------- */
  const handlePNGDownload = () => {
    whiteboardRef.current?.download();
  };

  /* -------------------- PDF Download -------------------- */
  const handlePDFDownload = async () => {
    if (!isPremium) {
      router.push("/upgrade");
      return;
    }

    const stageWidth = window.innerWidth - 60;
    const stageHeight = window.innerHeight - 100;

    const pdf = new jsPDF({
      orientation: stageWidth > stageHeight ? "landscape" : "portrait",
      unit: "px",
      format: [stageWidth, stageHeight],
    });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const canvas = document.createElement("canvas");
      canvas.width = stageWidth;
      canvas.height = stageHeight;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = slide.bg;
      ctx.fillRect(0, 0, stageWidth, stageHeight);

      slide.shapes.forEach((shape) => {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth || 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (shape.tool === "pen" || shape.tool === "eraser") {
          ctx.beginPath();
          for (let j = 0; j < shape.points.length - 2; j += 2) {
            ctx.moveTo(shape.points[j], shape.points[j + 1]);
            ctx.lineTo(shape.points[j + 2], shape.points[j + 3]);
          }
          ctx.stroke();
        }
        // ... rest of your shape logic ...
        if (shape.tool === "line") {
          ctx.beginPath();
          ctx.moveTo(shape.points[0], shape.points[1]);
          ctx.lineTo(shape.points[2], shape.points[3]);
          ctx.stroke();
        }
        if (shape.tool === "rect") {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        if (shape.tool === "circle") {
          ctx.beginPath();
          const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
          ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        if (shape.tool === "text") {
          ctx.fillStyle = shape.color;
          ctx.font = `${shape.fontSize || 24}px Arial`;
          ctx.fillText(shape.text, shape.x, shape.y);
        }
      });

      const imgData = canvas.toDataURL("image/png");
      if (i > 0) pdf.addPage([stageWidth, stageHeight]);
      pdf.addImage(imgData, "PNG", 0, 0, stageWidth, stageHeight);
    }

    pdf.save("whiteboard-slides.pdf");
  };

  /* -------------------- Keyboard Shortcuts -------------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        handleUndo();
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        handleRedo();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides, activeSlide]);

  /* -------------------- Toolbar Hover -------------------- */
  const resetHideTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowToolbar(false), 1500);
  };

  if (!user) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-green-50">
      <Header
        onDownload={handlePNGDownload}
        onDownloadPDF={handlePDFDownload}
        slides={slides}
        activeSlide={activeSlide}
        setActiveSlide={setActiveSlide}
        onAddSlide={handleAddSlide}
        user={user}
        profile={profile} // ✅ Passing the fetched profile object
        onLogout={handleLogout}
        isPremium={isPremium}
      />

      <main className="flex-1 overflow-hidden relative">
        <div
          onMouseEnter={() => {
            setShowToolbar(true);
            resetHideTimer();
          }}
          onMouseLeave={resetHideTimer}
          className="absolute top-0 left-0 w-full h-16 z-10"
        />

        <div
          className={`absolute top-6 left-1/2 -translate-x-1/2 z-20
          transition-all duration-500 ease-in-out
          ${
            showToolbar
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="backdrop-blur-md bg-white/80 shadow-xl rounded-2xl border border-white/40">
            <Toolbar
              currentTool={tool}
              setTool={setTool}
              strokeColor={color}
              setStrokeColor={setColor}
              strokeWidth={width}
              setStrokeWidth={setWidth}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={currentSlide.undoStack.length > 0}
              canRedo={currentSlide.redoStack.length > 0}
            />
          </div>
        </div>

        <div className="shadow-xl border border-gray-200 h-full">
          <Whiteboard
            ref={whiteboardRef}
            currentTool={tool}
            strokeColor={color}
            strokeWidth={width}
            bgFill={currentSlide.bg}
            shapes={currentSlide.shapes}
            setShapes={updateShapes}
            onActionStart={pushUndo}
            isPremium={isPremium}
          />
        </div>
      </main>
    </div>
  );
}