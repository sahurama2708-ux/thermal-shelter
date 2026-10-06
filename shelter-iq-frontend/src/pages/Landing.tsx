import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  CloudSun,
  BrainCircuit,
  Home as HomeIcon,
  Thermometer,
  Wind,
  Droplets,
  Sparkles,
  Satellite,
  Cpu,
  Wallet,
} from "lucide-react";
import Logo from "../components/common/Logo";
import HexaForgeBadge from "../components/common/HexaForgeBadge";
import ShelterBlueprint from "../components/marketing/ShelterBlueprint";
import ShelterModel3D from "../components/twin/ShelterModel3D";
import { DEFAULT_SHELTER_PARAMS } from "../components/twin/shelterTwinData";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  {
    n: "01",
    title: "Choose location",
    body: "Drop a pin or use your device location — any latitude and longitude on Earth works.",
    icon: MapPin,
  },
  {
    n: "02",
    title: "Analyze climate",
    body: "We pull temperature, humidity, wind, rainfall, and solar radiation for that spot and month.",
    icon: CloudSun,
  },
  {
    n: "03",
    title: "AI predicts thermal condition",
    body: "A trained model classifies the dominant thermal stress: heat, humidity, cold, wind, or solar load.",
    icon: BrainCircuit,
  },
  {
    n: "04",
    title: "Get adaptive shelter design",
    body: "Roof, walls, ventilation, and shading guidance tailored to what the climate actually demands.",
    icon: HomeIcon,
  },
];

const TECH_BADGES = ["Python", "FastAPI", "TensorFlow", "NASA POWER", "React", "TypeScript", "PostgreSQL"];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const analyzeHref = isAuthenticated ? "/predict" : "/login";

  return (
    <div className="bg-surface-sky">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-primary-100/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo size={30} />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-ink-600 hover:text-primary-700">
              How it works
            </a>
            <Link to="/about" className="text-sm font-medium text-ink-600 hover:text-primary-700">
              About
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary !px-4 !py-2 text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3D Digital Twin hero — the first thing visitors notice */}
      <section className="relative overflow-hidden bg-[#05070d] text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_100%_30%,rgba(99,102,241,0.14),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
              AI + Architecture + Digital Twin
            </span>
            <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-[1.1] text-balance sm:text-4xl lg:text-5xl">
              Shelter IQ: an AI-powered 3D smart shelter digital twin.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
              Rotate, zoom, and inspect a living model of your shelter. Click a component to see its
              live status, then run AI optimization to see recommended design changes play out in 3D.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={isAuthenticated ? "/twin" : "/login"}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.45)] transition-transform duration-200 hover:bg-cyan-400 active:scale-[0.98]"
              >
                Launch Digital Twin <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative h-[340px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl sm:h-[420px]">
            <ShelterModel3D params={DEFAULT_SHELTER_PARAMS} selected={null} className="h-full" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
              Drag to rotate · Scroll to zoom
            </div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-40" />
        <div className="absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-14 lg:grid-cols-2 lg:items-center lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Smart • Intelligent • Data-Driven
            </span>

            <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.1] text-ink-900 text-balance sm:text-5xl">
              Design smarter shelters for any climate.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-400">
              AI-powered thermal comfort prediction, climate-adaptive shelter recommendations, and
              transparent construction budgeting — all from a single location lookup.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={analyzeHref} className="btn-primary">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={isAuthenticated ? "/dashboard" : "#how-it-works"} className="btn-secondary">
                Explore Dashboard
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-2 text-xs text-ink-400">
              <Satellite className="h-4 w-4 text-primary-500" />
              Powered by NASA POWER climatology + a trained neural network
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md perspective-1000 lg:max-w-none">
            <div className="tilt-3d relative aspect-[5/4] w-full hover:[transform:rotateY(-4deg)_rotateX(3deg)]">
              <ShelterBlueprint />

              {/* floating climate cards */}
              <div className="absolute left-0 top-4 flex animate-drift items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-soft [animation-delay:0.2s]">
                <Thermometer className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-ink-900">34°C</span>
              </div>
              <div className="absolute right-0 top-16 flex animate-drift items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-soft [animation-delay:1.1s]">
                <Droplets className="h-4 w-4 text-sky-500" />
                <span className="text-sm font-semibold text-ink-900">38% RH</span>
              </div>
              <div className="absolute bottom-16 left-2 flex animate-drift items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-soft [animation-delay:0.6s]">
                <Wind className="h-4 w-4 text-teal-500" />
                <span className="text-sm font-semibold text-ink-900">14 km/h</span>
              </div>
              <div className="absolute bottom-4 right-2 flex animate-drift items-center gap-2 rounded-xl bg-primary-600 px-3.5 py-2.5 text-white shadow-glow [animation-delay:1.6s]">
                <BrainCircuit className="h-4 w-4" />
                <span className="text-sm font-semibold">AI: Hot-Dry · 94%</span>
              </div>
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 animate-drift items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-soft [animation-delay:0.9s]">
                <Wallet className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-ink-900">Budget: ₹42,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink-900">How it works</h2>
          <p className="mt-3 text-ink-400">
            Four steps stand between a location and a shelter design tuned to its climate.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="card relative overflow-hidden p-6">
              <span className="font-display text-4xl font-semibold text-primary-100">{step.n}</span>
              <div className="mt-3 mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-primary-100 bg-primary-50/50 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 shrink-0 text-primary-600" />
            <p className="text-sm text-ink-600">
              Under the hood: live T2M, RH2M, WS10M, PRECTOTCORR, and ALLSKY_SFC_SW_DWN readings from NASA
              POWER feed a trained ML pipeline — no manual climate research required.
            </p>
          </div>
        </div>
      </section>

      {/* Tech + CTA band */}
      <section className="border-t border-primary-100/70 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Ready to see what your climate demands?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
            Run your first analysis in under a minute — no architecture background required.
          </p>
          <Link to={analyzeHref} className="btn-primary mt-6">
            Analyze your climate <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {TECH_BADGES.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-ink-200 bg-surface-sky px-3.5 py-1.5 text-xs font-medium text-ink-600"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-primary-100/70 bg-surface-sky">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <Logo size={24} />
          <div className="flex items-center gap-5">
            <Link to="/about" className="text-xs font-medium text-ink-400 hover:text-primary-700">
              About HexaForge
            </Link>
            <HexaForgeBadge />
          </div>
        </div>
      </footer>
    </div>
  );
}
