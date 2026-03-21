const Footer = () => (
  <footer className="px-6 md:px-12 lg:px-20 py-12 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center gap-4">
    <span className="text-sm text-muted-foreground">
      © 2026 Craft. All rights reserved.
    </span>
    <div className="flex gap-6 text-sm text-muted-foreground">
      <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy</a>
      <a href="#" className="hover:text-foreground transition-colors duration-200">Terms</a>
      <a href="#" className="hover:text-foreground transition-colors duration-200">Twitter</a>
    </div>
  </footer>
);

export default Footer;
