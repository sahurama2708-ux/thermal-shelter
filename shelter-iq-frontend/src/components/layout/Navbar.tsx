import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Sparkles, History, Info, ChevronDown, LogOut, User as UserIcon, Menu, X, Wallet, Boxes } from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { initials } from "../../utils/format";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/predict", label: "Analyze Climate", icon: Sparkles },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/twin", label: "Digital Twin", icon: Boxes },
  { to: "/history", label: "History", icon: History },
  { to: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    showToast("Signed out successfully", "success");
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-primary-50 text-primary-700" : "text-ink-600 hover:bg-primary-50/60 hover:text-primary-700"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <NavLink to="/dashboard" aria-label="Thermal Shelter home">
            <Logo size={32} />
          </NavLink>
          <span className="hidden rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 sm:inline-block">
            HexaForge
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 hover:border-primary-100 hover:bg-primary-50/60"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-xs font-semibold text-white">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(user?.name, user?.email ?? "")
                )}
              </span>
              <span className="max-w-[120px] truncate text-sm font-medium text-ink-900">
                {user?.name || user?.email}
              </span>
              <ChevronDown className="h-4 w-4 text-ink-400" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-52 animate-fade-up rounded-xl border border-primary-100 bg-white py-1.5 shadow-glow"
              >
                <NavLink
                  to="/profile"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserIcon className="h-4 w-4" /> Profile
                </NavLink>
                <NavLink
                  to="/history"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-600 hover:bg-primary-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <History className="h-4 w-4" /> History
                </NavLink>
                <div className="my-1 border-t border-primary-50" />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-ink-600 hover:bg-primary-50 md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 animate-fade-up bg-white p-5 shadow-glow">
            <div className="flex items-center justify-between">
              <Logo size={28} />
              <button
                className="rounded-lg p-2 text-ink-600 hover:bg-primary-50"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary-50/60 p-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-semibold text-white">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(user?.name, user?.email ?? "")
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{user?.name || "Your account"}</p>
                <p className="truncate text-xs text-ink-400">{user?.email}</p>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setDrawerOpen(false)}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/profile" className={linkClass} onClick={() => setDrawerOpen(false)}>
                <UserIcon className="h-4 w-4" />
                Profile
              </NavLink>
            </nav>

            <button
              onClick={() => {
                setDrawerOpen(false);
                handleLogout();
              }}
              className="mt-6 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
