import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import HexaForgeBadge from "../common/HexaForgeBadge";

export default function Footer() {
  return (
    <footer className="border-t border-primary-100/70 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <Logo size={24} />
          <p className="mt-1.5 text-xs text-ink-400">AI-Powered Climate Adaptive Shelter Design</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-xs font-medium text-ink-400 hover:text-primary-700">
            About
          </Link>
          <HexaForgeBadge />
        </div>
      </div>
    </footer>
  );
}
