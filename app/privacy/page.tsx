import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our privacy policy and data protection practices",
};

export default function PrivacyPage() {
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
            Privacy Policy
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
            <h2 className="text-2xl font-bold text-foreground">Introduction</h2>
            <p className="text-foreground/80 leading-relaxed">
              This Privacy Policy describes how our tutoring platform
              ("Platform," "we," "us," or "our"), based in Benin City, Edo
              State, Nigeria, collects, uses, and protects your personal
              information. We are committed to maintaining the privacy and
              security of your data in accordance with Nigerian Data Protection
              Regulation (NDPR) and international best practices.
            </p>
          </div>

          {/* Information We Collect */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Personal Information
                </h3>
                <p className="text-foreground/80 leading-relaxed mb-2">
                  When you register, we collect:
                </p>
                <ul className="list-disc list-inside text-foreground/80 space-y-1 ml-2">
                  <li>Name, email address, and phone number</li>
                  <li>Date of birth and identification documents</li>
                  <li>Educational background and qualifications</li>
                  <li>Professional experience and credentials</li>
                  <li>Payment information (processed securely)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Usage Data
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  We automatically collect information about how you interact
                  with our Platform, including IP addresses, browser type, pages
                  visited, and time spent on the Platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Communication Data
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  Messages, feedback, and support communications you send to us
                  are retained to improve our services.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>Provide and improve our Platform services</li>
              <li>Verify tutor credentials and conduct background checks</li>
              <li>Process transactions and send related information</li>
              <li>Communicate with you about service updates and support</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              3. Data Security
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We implement comprehensive security measures to protect your
              information, including encryption, secure servers, and restricted
              access to personal data. However, no method of transmission over
              the internet is 100% secure.
            </p>
          </div>

          {/* Sharing Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              4. Sharing of Information
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              We do not sell or rent your personal information. We may share
              information:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>With service providers who assist in platform operations</li>
              <li>For legal compliance and law enforcement requests</li>
              <li>In connection with mergers or acquisitions</li>
              <li>With your consent for specific purposes</li>
            </ul>
          </div>

          {/* User Rights */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              5. Your Rights
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>Access and review your personal information</li>
              <li>Request corrections or updates to your data</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability in certain circumstances</li>
            </ul>
          </div>

          {/* Cookies and Tracking */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              6. Cookies and Tracking Technologies
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We use cookies and similar technologies to enhance user
              experience, analyze platform usage, and remember preferences. You
              can control cookie settings through your browser preferences.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              7. Children's Privacy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              Our Platform is not intended for children under 13. We do not
              knowingly collect personal information from children under 13. If
              we learn we have collected such information, we will promptly
              delete it.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              8. Changes to This Privacy Policy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you
              of significant changes by updating the "Last updated" date and
              posting the new policy on this page.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-card p-8 rounded-lg border border-border space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at:
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
    </main>
  );
}
