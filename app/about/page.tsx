import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our tutor platform and mission',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            About Us
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            We're on a mission to connect exceptional tutors with students who are ready to learn. Our platform makes it easy for qualified educators to share their expertise and help students reach their academic goals.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 space-y-16">
          {/* Mission */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="text-foreground/80 leading-relaxed">
              We are committed to transforming education across Nigeria by connecting exceptional tutors with students who are ready to excel. Our platform removes barriers to quality education, helping every student in Benin City, Edo State, and beyond reach their full academic potential.
            </p>
          </div>

          {/* Values */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Excellence</h3>
                <p className="text-foreground/80 leading-relaxed">
                  We're committed to maintaining the highest standards in tutor verification and student support.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Trust</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Our platform is built on transparency and security, ensuring safe interactions for all users.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Impact</h3>
                <p className="text-foreground/80 leading-relaxed">
                  We measure success by the real improvement in student grades and confidence.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Accessibility</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Education should be available to all, regardless of location or background.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">How We Work</h2>
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Tutor Registration</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Tutors apply and provide their qualifications, background, and teaching experience for thorough verification.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Verification</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    We verify educational credentials and conduct background checks to ensure student safety.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Connection</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Students browse verified tutors, read reviews, and connect with the right educator for their needs.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-semibold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Learning</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Tutors and students collaborate to achieve academic goals with ongoing support and progress tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Commitment */}
          <div className="bg-card p-8 rounded-lg border border-border space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Our Commitment to Safety & Excellence</h2>
            <p className="text-foreground/80 leading-relaxed">
              The safety and well-being of our users is our top priority. Every tutor undergoes comprehensive verification including identity checks, credential validation, and background screening. We maintain strict data protection standards compliant with Nigerian regulations and international best practices. Our team is based in Benin City, Edo State, and understands the local educational landscape while maintaining world-class standards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-border bg-card py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Ready to get started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Register as a Tutor
            </Link>
            <Link href="/contact" className="px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
