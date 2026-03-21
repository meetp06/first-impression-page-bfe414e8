import ScrollReveal from "../ScrollReveal";

const CTA = () => (
  <section id="contact" className="px-6 md:px-12 lg:px-20 py-32">
    <ScrollReveal>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-display tracking-tight text-foreground mb-6 leading-[1.1]">
          Ready to think differently?
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Join thousands of makers who've traded complexity for clarity.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-5 py-3.5 rounded-lg border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow duration-200"
          />
          <button className="w-full sm:w-auto whitespace-nowrap px-7 py-3.5 text-sm font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity duration-200 active:scale-[0.97]">
            Get early access
          </button>
        </div>
      </div>
    </ScrollReveal>
  </section>
);

export default CTA;
