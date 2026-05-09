import { Link } from 'react-router-dom';
import { Feather, Brain, Palette, Lock, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Feather className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">GiffyDuck AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Your thoughts, <span className="text-primary">amplified by AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            GiffyDuck AI is a powerful notes platform that helps you capture ideas,
            organize thoughts, and supercharge your productivity with intelligent AI assistance.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold text-foreground">
              Everything you need
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={Brain}
                title="AI Powered"
                desc="Get intelligent suggestions and chat with AI about your notes."
              />
              <FeatureCard
                icon={Palette}
                title="Beautiful Themes"
                desc="Choose from dark, Tokyo Night, light, and solarized themes."
              />
              <FeatureCard
                icon={Lock}
                title="Secure"
                desc="JWT-based authentication with encrypted password storage."
              />
              <FeatureCard
                icon={Zap}
                title="Fast"
                desc="Built with Vite and React for lightning-fast performance."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        GiffyDuck AI. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
