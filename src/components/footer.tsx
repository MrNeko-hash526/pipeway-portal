export function Footer() {
  return (
    <footer className="bg-[var(--footer-bg)] border-t border-border/50 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground/80 font-medium">
            © 2024 Pipeway. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground/70 tracking-wide">
            Licensed debt collection agency
          </p>
        </div>
      </div>
    </footer>
  )
}
