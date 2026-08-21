export default function LandingFooter({ handleScrollTo }) {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 sm:py-12 border-t border-slate-800 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            H
          </div>
          <span className="text-base font-bold text-white tracking-tight">HireQuest</span>
        </div>

        <p>© {new Date().getFullYear()} HireQuest Technologies. All rights reserved.</p>

        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <a
            href="#about"
            onClick={(e) => handleScrollTo(e, "about")}
            className="hover:text-white transition-colors"
          >
            About Us
          </a>
          <a
            href="#services"
            onClick={(e) => handleScrollTo(e, "services")}
            className="hover:text-white transition-colors"
          >
            Services
          </a>
          <a
            href="#faq"
            onClick={(e) => handleScrollTo(e, "faq")}
            className="hover:text-white transition-colors"
          >
            FAQ
          </a>
          <a
            href="#contact"
            onClick={(e) => handleScrollTo(e, "contact")}
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
