import ScrollReveal from "../ScrollReveal";
import { Zap, Layers, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant capture",
    description: "Thoughts don't wait. Neither should your tools. Capture ideas in milliseconds, organize them later.",
  },
  {
    icon: Layers,
    title: "Deep structure",
    description: "Everything connects. Build relationships between notes, tasks, and projects that mirror how you think.",
  },
  {
    icon: ArrowRight,
    title: "Flow state",
    description: "Minimal chrome, maximum focus. Every interaction is designed to keep you in the zone, not pull you out.",
  },
];

const Features = () => (
  <section id="features" className="px-6 md:px-12 lg:px-20 py-32">
    <ScrollReveal>
      <p className="text-sm font-medium tracking-widest uppercase text-primary mb-4">
        What sets us apart
      </p>
      <h2 className="text-3xl md:text-5xl font-display tracking-tight text-foreground mb-20 max-w-xl leading-[1.1]">
        Less software,
        <br />
        more clarity.
      </h2>
    </ScrollReveal>

    <div className="grid md:grid-cols-3 gap-6">
      {features.map((feature, i) => (
        <ScrollReveal key={feature.title} delay={i * 0.1}>
          <div className="group p-8 rounded-2xl bg-card border border-border/60 hover:shadow-lg hover:shadow-foreground/[0.03] transition-shadow duration-300">
            <feature.icon className="w-5 h-5 text-primary mb-6" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">{feature.description}</p>
          </div>
        </ScrollReveal>
      ))}
    </div>
  </section>
);

export default Features;
