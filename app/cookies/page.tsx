import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Our cookie and tracking practices",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Cookie Policy
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Last updated: March 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 space-y-12">
          {/* Introduction */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              What Are Cookies?
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Cookies are small text files stored on your device when you visit
              our Platform. They help us recognize you, enhance your experience,
              and understand how you use our services. We use cookies in
              compliance with Nigerian Data Protection Regulation (NDPR) and
              applicable international data protection standards.
            </p>
          </div>

          {/* Types of Cookies */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Types of Cookies We Use
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Essential Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  These cookies are necessary for the Platform to function
                  properly. They enable authentication, security features, and
                  core functionality. Without these cookies, the Platform cannot
                  operate.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Examples: Session ID, security tokens, login credentials
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Performance Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  These cookies help us understand how users interact with the
                  Platform by tracking page views, performance metrics, and user
                  behavior. They help us improve service quality and user
                  experience.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Examples: Pages visited, time on site, errors encountered
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Functional Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  These cookies remember your preferences and settings to
                  provide a more personalized experience. They may include
                  language preferences, notification settings, and user
                  preferences.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Examples: Language preference, notification settings, theme
                  selection
                </p>
              </div>

              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Marketing Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  These cookies track your activity to deliver targeted
                  advertisements and marketing content. They may be set by us or
                  third-party partners.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Examples: Advertising preferences, campaign tracking,
                  conversion data
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Third-Party Cookies
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We use services from third-party providers that may place their
              own cookies on your device:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>
                <strong>Analytics:</strong> Google Analytics for usage insights
              </li>
              <li>
                <strong>Payment Processing:</strong> Stripe for secure
                transactions
              </li>
              <li>
                <strong>Social Media:</strong> Share buttons and integration
              </li>
              <li>
                <strong>Customer Support:</strong> Chat and support tools
              </li>
            </ul>
          </div>

          {/* Data Retention */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Cookie Duration
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Session Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  These cookies are deleted when you close your browser. They
                  exist only for the duration of your session.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Persistent Cookies
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  These cookies remain on your device until they expire or you
                  delete them. They can last from days to years depending on the
                  cookie's purpose.
                </p>
              </div>
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Managing Your Cookies
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              You have control over cookies through your browser settings:
            </p>

            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Browser Controls
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  Most browsers allow you to refuse cookies or alert you when
                  cookies are being sent. You can typically find cookie settings
                  in your browser's "Privacy," "Security," or "Settings" menu.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Opting Out
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  You can opt out of marketing cookies through advertising
                  preference centers or by using the "Do Not Track" feature in
                  your browser.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Important Note
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  Disabling essential cookies may affect Platform functionality.
                  You can disable other cookies without impacting core features.
                </p>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Changes to This Policy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Cookie Policy to reflect changes in our
              practices or applicable regulations. We will notify you of
              material changes by updating the "Last updated" date and, if
              necessary, sending you a notice.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-card p-8 rounded-lg border border-border space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Have Questions?
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have questions about our use of cookies or this Cookie
              Policy:
            </p>
            <div className="space-y-2">
              <p className="text-foreground">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@tutorplatform.com.ng"
                  className="text-primary hover:text-primary/80"
                >
                  privacy@tutorplatform.com.ng
                </a>
              </p>
              <p className="text-foreground">
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:+234703123456"
                  className="text-primary hover:text-primary/80"
                >
                  +234 (703) 123-4567
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
    </main>
  );
}
