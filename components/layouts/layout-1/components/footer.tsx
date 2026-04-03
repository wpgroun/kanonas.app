import { generalSettings } from '@/config/general.config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer border-t border-border/50">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 py-5">
          <div className="flex order-2 md:order-1 gap-2 font-medium text-sm">
            <span className="text-muted-foreground">{currentYear} &copy;</span>
            <a
              href="#"
              className="text-secondary-foreground hover:text-primary transition-colors"
            >
              ChurchOS Management System
            </a>
          </div>
          <nav className="flex order-1 md:order-2 gap-4 font-normal text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Βοήθεια & Υποστήριξη
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Όροι Χρήσης
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
