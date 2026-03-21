import { motion } from "framer-motion";

const Navbar = () => (
  <motion.nav
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20 bg-background/80 backdrop-blur-md border-b border-border/50"
  >
    <span className="text-xl font-semibold tracking-tight font-display text-foreground">
      Craft
    </span>
    <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
      <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
      <a href="#about" className="hover:text-foreground transition-colors duration-200">About</a>
      <a href="#contact" className="hover:text-foreground transition-colors duration-200">Contact</a>
    </div>
    <button className="px-5 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]">
      Join Waitlist
    </button>
  </motion.nav>
);

export default Navbar;
