export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">P</span>
              </div>
              <span className="font-bold text-foreground">Pipeway</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              Professional debt collection services with a focus on compliance, efficiency, and results.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="#accounts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Account Tracker
              </a>
              <a href="#reports" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Reports
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Support</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Help Center
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Compliance
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FDCPA Notice
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                State Licenses
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Security
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Pipeway. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Licensed debt collection agency</p>
        </div>
      </div>
    </footer>
  )
}
