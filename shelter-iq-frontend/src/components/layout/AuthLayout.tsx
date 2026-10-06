import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Wind, Droplets, Thermometer, Sparkles } from "lucide-react";
import Logo from "../common/Logo";
import HexaForgeBadge from "../common/HexaForgeBadge";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen bg-surface-sky lg:grid-cols-2">
      {/* Left: illustration */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0 bg-blueprint opacity-[0.12]" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-2.5 text-white">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <rect width="40" height="40" rx="10" fill="white" fillOpacity="0.15" />
            <path d="M9 21L20 11L31 21" stroke="white" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.5 21V29.5H26.5V21" stroke="white" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="17.5" r="2.1" fill="white" />
          </svg>
          <span className="font-display text-lg font-semibold">Thermal Shelter</span>
        </Link>

        <div className="relative z-10 my-auto py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-primary-100/80">
            Climate-adaptive design
          </p>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight text-white text-balance">
            Every shelter should answer to the climate it stands in.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-100/90">
            Enter a location and Thermal Shelter reads NASA POWER climatology through a
            trained model to recommend how a structure should breathe, shade, and hold heat.
          </p>

          {/* floating metric chips echoing the landing hero, in miniature */}
          <div className="mt-10 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-white backdrop-blur-md">
              <Thermometer className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-medium">32°C</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-white backdrop-blur-md">
              <Droplets className="h-4 w-4 text-sky-200" />
              <span className="text-sm font-medium">41% RH</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-white backdrop-blur-md">
              <Wind className="h-4 w-4 text-teal-200" />
              <span className="text-sm font-medium">12 km/h</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-primary-700 shadow-soft">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">AI: Hot-Dry</span>
            </div>
          </div>
        </div>

        <HexaForgeBadge className="relative z-10 text-primary-100/80 [&_span]:text-white" />
      </div>

      {/* Right: form */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/">
              <Logo size={30} />
            </Link>
          </div>

          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-10 flex items-center justify-between lg:hidden">
            <HexaForgeBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
