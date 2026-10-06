import { Link } from "react-router-dom";
import { ArrowRight, Satellite, BrainCircuit, Home as HomeIcon } from "lucide-react";
import Logo from "../components/common/Logo";
import { useAuth } from "../context/AuthContext";

const TECH_BADGES = ["Python", "FastAPI", "TensorFlow", "NASA POWER", "React", "TypeScript", "PostgreSQL"];

const TEAM_MEMBERS = [
  { name: "Mujahid Husain", role: "Team Lead" },
  { name: "Aisha Khan", role: "Team Member" },
  { name: "Junaid Raza", role: "Team Member" },
  { name: "Awwaleen", role: "Team Member" },
  { name: "Rama Sahu", role: "Team Member" },
  { name: "Vaishnavi", role: "Team Member" },
];

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-surface-sky">
      <header className="border-b border-primary-100/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <Logo size={30} />
          </Link>
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="btn-primary !px-4 !py-2 text-sm">
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-primary-700">
          HexaForge
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
          Building intelligent solutions for real-world problems.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-400">
          Thermal Shelter combines climate data, machine learning, and climate-adaptive architecture
          into one workflow — turning a location and a month into a concrete design direction.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <Satellite className="mx-auto h-6 w-6 text-primary-600" />
            <p className="mt-3 font-semibold text-ink-900">Climate Data</p>
            <p className="mt-1 text-sm text-ink-400">NASA POWER climatology by coordinate and month.</p>
          </div>
          <div className="card p-6 text-center">
            <BrainCircuit className="mx-auto h-6 w-6 text-primary-600" />
            <p className="mt-3 font-semibold text-ink-900">Machine Learning</p>
            <p className="mt-1 text-sm text-ink-400">A trained model classifies dominant thermal stress.</p>
          </div>
          <div className="card p-6 text-center">
            <HomeIcon className="mx-auto h-6 w-6 text-primary-600" />
            <p className="mt-3 font-semibold text-ink-900">Adaptive Architecture</p>
            <p className="mt-1 text-sm text-ink-400">Concrete guidance on roof, walls, and ventilation.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-primary-100/70 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-ink-900">HexaForge</h2>
            <p className="mt-2 text-ink-400">
              Hacking climate challenges into smarter shelter solutions.
            </p>
            <span className="mt-4 inline-block rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700">
              Built for Hackathon 2026
            </span>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="card flex flex-col items-center p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-400">
                  {member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <p className="mt-4 text-sm font-semibold text-ink-900">{member.name}</p>
                <p className="text-xs text-ink-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold text-ink-900">Built with</h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {TECH_BADGES.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-600"
            >
              {tech}
            </span>
          ))}
        </div>

        {!isAuthenticated && (
          <Link to="/register" className="btn-primary mt-8">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </section>
    </div>
  );
}
