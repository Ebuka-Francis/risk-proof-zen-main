import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display font-semibold text-xs tracking-tight">
              AleoRisk
            </Link>
            <span className="text-2xs text-muted-foreground">
              Privacy-Preserving Risk Analytics
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/upload" className="text-2xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              Upload
            </Link>
            <Link to="/dashboard" className="text-2xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              Dashboard
            </Link>
            <Link to="/verify" className="text-2xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              Verify
            </Link>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-2xs text-muted-foreground text-center">
            © 2025 AleoRisk. Built on Aleo for zero-knowledge privacy.
          </p>
        </div>
      </div>
    </footer>
  );
}
