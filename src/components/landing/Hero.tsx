import { motion } from "framer-motion";

const Hero = () => (
  <section className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-24">
    <div className="max-w-3xl">
      <motion.p
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm font-medium tracking-widest uppercase text-primary mb-6"
      >
        Built for makers
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.95] tracking-tight text-foreground mb-8"
      >
        Tools that feel
        <br />
        like an extension
        <br />
        of your mind.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10"
      >
        Craft removes the friction between thinking and doing. 
        A workspace designed around how you actually work — not how software thinks you should.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="flex gap-4"
      >
        <button className="px-7 py-3.5 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity duration-200 active:scale-[0.97] shadow-lg shadow-foreground/10">
          Start building →
        </button>
        <button className="px-7 py-3.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors duration-200 active:scale-[0.97]">
          See how it works
        </button>
      </motion.div>
    </div>
  </section>
);

export default Hero;
