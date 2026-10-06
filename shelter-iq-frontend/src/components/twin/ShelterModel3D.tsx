import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { CAMERA_PRESETS, type CameraPresetId, type HotspotId, type ShelterParams } from "./shelterTwinData";

export type ShelterModel3DHandle = {
  flyTo: (preset: CameraPresetId) => void;
};

type Props = {
  params: ShelterParams;
  selected: HotspotId | null;
  optimizing?: boolean;
  interactive?: boolean;
  className?: string;
};

type Camera = { rotX: number; rotY: number; zoom: number; panX: number; panY: number };

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// Base model dimensions in px (the whole model is authored at this scale, then
// scaled responsively by the wrapping .twin-scene container via CSS zoom).
const W = 340;
const D = 240;
const H = 150;

const ShelterModel3D = forwardRef<ShelterModel3DHandle, Props>(function ShelterModel3D(
  { params, selected, optimizing, interactive = true, className = "" },
  ref,
) {
  const [camera, setCamera] = useState<Camera>({ ...CAMERA_PRESETS.overview });
  const [dragging, setDragging] = useState(false);
  const [smooth, setSmooth] = useState(false);
  const dragState = useRef<{ x: number; y: number; button: number } | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const autoRotate = useRef(true);

  useImperativeHandle(ref, () => ({
    flyTo(preset: CameraPresetId) {
      autoRotate.current = false;
      setSmooth(true);
      setCamera({ ...CAMERA_PRESETS[preset] });
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        autoRotate.current = true;
      }, 5000);
    },
  }));

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      if (autoRotate.current && !dragging) {
        setSmooth(false);
        setCamera((c) => ({ ...c, rotY: c.rotY + dt * 0.006 }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      autoRotate.current = false;
      setSmooth(false);
      setDragging(true);
      dragState.current = { x: e.clientX, y: e.clientY, button: e.button };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    [interactive],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.x;
    const dy = e.clientY - dragState.current.y;
    const isPan = dragState.current.button === 2;
    dragState.current = { x: e.clientX, y: e.clientY, button: dragState.current.button };
    if (isPan) {
      setCamera((c) => ({ ...c, panX: clamp(c.panX + dx, -140, 140), panY: clamp(c.panY + dy, -100, 100) }));
    } else {
      setCamera((c) => ({ ...c, rotY: c.rotY + dx * 0.35, rotX: clamp(c.rotX - dy * 0.25, -12, 82) }));
    }
  }, []);

  const endDrag = useCallback(() => {
    setDragging(false);
    dragState.current = null;
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      autoRotate.current = true;
    }, 4500);
  }, []);

  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      if (!interactive) return;
      e.preventDefault();
      setSmooth(false);
      setCamera((c) => ({ ...c, zoom: clamp(c.zoom - e.deltaY * 0.0009, 0.6, 2.2) }));
    },
    [interactive],
  );

  const rigStyle: CSSProperties = {
    transform: `translate(${camera.panX}px, ${camera.panY}px) scale(${camera.zoom}) rotateX(${camera.rotX}deg) rotateY(${camera.rotY}deg)`,
    transition: smooth ? "transform 900ms cubic-bezier(0.16,1,0.3,1)" : "none",
  };

  const bodyStyle: CSSProperties = {
    transform: `rotateY(${params.orientation}deg)`,
    transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
  };

  const solarVisible = Math.max(2, Math.round((params.solarArea / 100) * 16));
  const roofRotateX = 96 + (params.roofAngle - 15) * 0.55;
  const batteryScale = 0.6 + (params.batteryCapacity / 100) * 0.85;
  const ventOpacity = 0.3 + (params.ventilation / 100) * 0.7;
  const wallGlow = 0.08 + (params.material / 100) * 0.28;
  const windowGlow = 0.22 + (params.insulation / 100) * 0.45;
  const windowBlur = 10 + (params.insulation / 100) * 18;
  const personCount = Math.max(1, Math.min(5, Math.round((params.occupancy / 20) * 5)));

  const isSel = (id: HotspotId) => selected === id;

  return (
    <div
      className={`twin-scene relative select-none ${className}`}
      style={{ perspective: 1600, cursor: interactive ? (dragging ? "grabbing" : "grab") : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onWheel={onWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="twin-ambient" />
      <div
        className="absolute left-1/2 top-1/2"
        style={{ ...rigStyle, transformStyle: "preserve-3d", marginLeft: -W / 2, marginTop: -H / 2 }}
      >
        <div
          className={`relative ${optimizing ? "twin-optimizing" : ""}`}
          style={{ ...bodyStyle, transformStyle: "preserve-3d", width: W, height: H }}
        >
          {/* platform */}
          <div
            className="absolute rounded-[36px] border border-cyan-400/35"
            style={{
              width: W + 180,
              height: D + 160,
              left: -90,
              top: H / 2,
              transform: "rotateX(90deg)",
              transformStyle: "preserve-3d",
              background: "radial-gradient(closest-side, rgba(56,189,248,0.16), rgba(8,12,24,0.85) 72%)",
              boxShadow: "0 0 70px rgba(56,189,248,0.22), inset 0 0 50px rgba(56,189,248,0.08)",
            }}
          >
            <div
              className={`absolute inset-0 rounded-[36px] transition-shadow duration-500 ${isSel("occupancy") ? "twin-part-selected" : ""}`}
              style={{
                backgroundImage:
                  "linear-gradient(rgba(56,189,248,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.16) 1px, transparent 1px)",
                backgroundSize: "26px 26px",
                maskImage: "radial-gradient(closest-side, black 55%, transparent 100%)",
              }}
            />
            {/* people silhouettes */}
            {Array.from({ length: personCount }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-t-[7px] rounded-b-[3px] bg-gradient-to-b from-slate-200/60 to-slate-200/10"
                style={{
                  width: 12,
                  height: 30,
                  left: W / 2 - 60 + i * 26,
                  top: D / 2 + 26,
                  transform: "rotateX(-90deg) translateZ(15px)",
                }}
              />
            ))}
          </div>

          {/* front wall (door + windows) */}
          <Wall
            style={{ width: W, height: H, transform: `translateZ(${D / 2}px)` }}
            glow={wallGlow}
          >
            <div
              className="absolute bottom-0 left-1/2 rounded-t-md border border-cyan-300/80"
              style={{
                width: 58,
                height: 96,
                marginLeft: -29,
                background: "linear-gradient(180deg, rgba(56,189,248,0.22), rgba(56,189,248,0.05))",
                boxShadow: "0 0 18px rgba(56,189,248,0.45)",
              }}
            />
            <div
              className="absolute rounded-[5px] border border-blue-200/55"
              style={{
                width: 52,
                height: 44,
                bottom: 34,
                left: 44,
                background: "linear-gradient(160deg, rgba(103,232,249,0.35), rgba(30,64,175,0.25))",
                boxShadow: `0 0 ${windowBlur}px rgba(56,189,248,${windowGlow})`,
              }}
            />
            <div
              className="absolute rounded-[5px] border border-blue-200/55"
              style={{
                width: 52,
                height: 44,
                bottom: 34,
                right: 44,
                background: "linear-gradient(160deg, rgba(103,232,249,0.35), rgba(30,64,175,0.25))",
                boxShadow: `0 0 ${windowBlur}px rgba(56,189,248,${windowGlow})`,
              }}
            />
            {/* porch light */}
            <div
              className="absolute rounded-full"
              style={{
                width: 8,
                height: 8,
                left: "50%",
                top: 6,
                marginLeft: -4,
                background: "#fde68a",
                boxShadow: "0 0 14px 4px rgba(253,230,138,0.7)",
              }}
            />
          </Wall>

          <Wall style={{ width: W, height: H, transform: `translateZ(${-D / 2}px) rotateY(180deg)` }} glow={wallGlow} />
          <Wall style={{ width: D, height: H, transform: `translateX(${-W / 2}px) rotateY(-90deg)` }} glow={wallGlow} />
          <Wall style={{ width: D, height: H, transform: `translateX(${W / 2}px) rotateY(90deg)` }} glow={wallGlow} />

          {/* roof + solar + vents */}
          <div
            className="absolute rounded-2xl border border-cyan-300/40"
            style={{
              width: W + 30,
              height: D + 30,
              left: -15,
              top: -H / 2,
              transform: `rotateX(${roofRotateX}deg)`,
              background: "linear-gradient(135deg, rgba(71,85,105,0.96), rgba(15,23,42,0.99))",
              boxShadow: "0 -6px 30px rgba(56,189,248,0.2), inset 0 1px 0 rgba(226,232,240,0.15)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className={`absolute grid grid-cols-4 gap-1.5 transition-shadow duration-500 ${isSel("solar") ? "twin-part-selected" : ""}`}
              style={{ left: 24, top: 24, right: 24, bottom: 70 }}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[3px] border border-blue-200/60"
                  style={{
                    background: "linear-gradient(135deg,#1d4ed8,#0ea5e9)",
                    boxShadow: "inset 0 0 8px rgba(255,255,255,0.25)",
                    opacity: i < solarVisible ? 1 : 0.08,
                  }}
                />
              ))}
            </div>
            <div
              className={`absolute flex gap-1 transition-opacity duration-500 ${isSel("ventilation") ? "twin-part-selected" : ""}`}
              style={{ left: 24, right: 24, bottom: 18, height: 34, opacity: ventOpacity }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded border border-blue-200/30"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(180deg, rgba(148,197,253,0.5) 0 3px, transparent 3px 8px)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* sensor mast */}
          <div
            className="absolute"
            style={{
              width: 3,
              height: 70,
              left: W / 2 - 20,
              top: -H / 2 - 70,
              transform: `translateZ(${D / 2 - 20}px)`,
              background: "linear-gradient(180deg, rgba(148,197,253,0.1), rgba(148,197,253,0.7))",
            }}
          >
            <div
              className={`absolute -left-[5px] -top-[6px] h-[13px] w-[13px] rounded-full transition-shadow duration-500 ${isSel("sensor") ? "twin-part-selected" : ""}`}
              style={{ background: "#67e8f9", boxShadow: "0 0 16px 4px rgba(103,232,249,0.8)" }}
            />
          </div>

          {/* battery */}
          <div
            className={`absolute rounded-md border border-emerald-300/60 transition-shadow duration-500 ${isSel("battery") ? "twin-part-selected" : ""}`}
            style={{
              width: 26,
              height: 70,
              left: W / 2 + 14,
              top: H / 2 - 70,
              transform: `translateZ(60px) scaleY(${batteryScale})`,
              transformOrigin: "bottom",
              background: "linear-gradient(180deg, rgba(16,185,129,0.35), rgba(5,150,105,0.15))",
              boxShadow: "0 0 16px rgba(16,185,129,0.35)",
            }}
          />
        </div>
      </div>
    </div>
  );
});

export default ShelterModel3D;

function Wall({ style, children, glow }: { style: CSSProperties; children?: ReactNode; glow: number }) {
  return (
    <div
      className="absolute rounded-[10px] border border-blue-200/30"
      style={{
        ...style,
        background: "linear-gradient(180deg, rgba(51,65,85,0.88), rgba(8,10,18,0.97))",
        boxShadow: `inset 0 0 30px rgba(56,189,248,${glow}), inset 0 1px 0 rgba(226,232,240,0.12)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
