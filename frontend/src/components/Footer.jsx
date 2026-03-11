import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const noTopGapPages = new Set(["/", "/partners", "/sponsors", "/support", "/terms"]);
  const hasNoTopGap = noTopGapPages.has(location.pathname);

  return (
    <footer className={`${hasNoTopGap ? "mt-0" : "mt-10"} border-t border-green-100 bg-white/90 backdrop-blur`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <Link to="/support" className="transition hover:text-rescue-dark">
            Contact Support
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/register" className="transition hover:text-rescue-dark">
            Collaboration
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/sponsors" className="transition hover:text-rescue-dark">
            Sponsors
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/partners" className="transition hover:text-rescue-dark">
            Partners
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/terms" className="transition hover:text-rescue-dark">
            Terms
          </Link>
        </div>

        <div className="flex w-full flex-col gap-2 border-t border-green-100 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>AI Business Rescue - Hackathon Edition</p>
          <p className="text-rescue-dark">Powered by Amazon Nova on AWS</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
