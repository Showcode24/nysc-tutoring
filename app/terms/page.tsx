import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Our terms and conditions",
};

export default function TermsPage() {
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
            Terms of Service
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
              1. Agreement to Terms
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              By accessing and using this Platform operated by Tutor Platform
              Nigeria Ltd. (based in Benin City, Edo State), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </div>

          {/* User Accounts */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              2. User Accounts
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              When registering, you must:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your password</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Notify us immediately of unauthorized access</li>
              <li>Be at least 18 years of age</li>
            </ul>
          </div>

          {/* Platform Rules */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              3. Acceptable Use Policy
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>Harass, threaten, or intimidate other users</li>
              <li>Post false or misleading information</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to the Platform</li>
              <li>Engage in fraud or misrepresentation</li>
              <li>Share explicit or offensive content</li>
              <li>Violate intellectual property rights</li>
            </ul>
          </div>

          {/* Tutor Requirements */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              4. Tutor Requirements
            </h2>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Tutors must comply with the following requirements to operate on
                our platform:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
                <li>
                  Provide verified educational credentials from recognized
                  Nigerian institutions
                </li>
                <li>Undergo and pass comprehensive background checks</li>
                <li>
                  Comply with Nigerian educational regulations and standards
                </li>
                <li>Maintain professional conduct at all times</li>
                <li>
                  Disclose any conflicts of interest or teaching restrictions
                </li>
                <li>Respect student confidentiality and privacy per NDPR</li>
                <li>
                  Provide valid means of identification and banking information
                </li>
              </ul>
            </div>
          </div>

          {/* Payment and Billing */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              5. Payment Terms
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              By using paid services:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>You authorize us to charge your provided payment method</li>
              <li>You are responsible for all charges incurred</li>
              <li>Refund policies will be communicated clearly</li>
              <li>We reserve the right to update pricing with notice</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              6. Intellectual Property Rights
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              All content on the Platform, including text, graphics, logos, and
              software, is the property of the Platform or its content suppliers
              and is protected by international copyright laws. You may not
              reproduce, distribute, or transmit any content without our prior
              written permission.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              7. Limitation of Liability
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              To the fullest extent permitted by law, the Platform and its
              operators shall not be liable for any indirect, incidental,
              special, or consequential damages resulting from your use or
              inability to use the Platform or services.
            </p>
          </div>

          {/* Termination */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              8. Termination
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We reserve the right to terminate or suspend your account
              immediately if you violate these terms or engage in conduct that
              we deem inappropriate. You may also terminate your account at any
              time by contacting support.
            </p>
          </div>

          {/* Disputes */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              9. Dispute Resolution
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-3">
              Any disputes arising from these terms or your use of the Platform
              shall be:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 ml-2">
              <li>
                First addressed through good faith negotiation between parties
              </li>
              <li>If unresolved, subject to mediation under Nigerian law</li>
              <li>If mediation fails, resolved through Nigerian courts</li>
              <li>Governed by the laws of the Federal Republic of Nigeria</li>
            </ul>
          </div>

          {/* Changes to Terms */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              10. Changes to Terms
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We may modify these terms at any time. Continued use of the
              Platform following such changes constitutes acceptance of the new
              terms. We will notify users of significant changes via email or
              platform announcement.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-card p-8 rounded-lg border border-border space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Questions?</h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <div className="space-y-2">
              <p className="text-foreground">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:legal@tutorplatform.com.ng"
                  className="text-primary hover:text-primary/80"
                >
                  legal@tutorplatform.com.ng
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
