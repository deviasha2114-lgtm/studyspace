import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'StudySpace - Learn Together, Grow Together',
  description: 'Join StudySpace to connect with classmates, join study groups, share resources, and ace your exams together.',
  icons: [
    {
      url: '/icons/icon-144x144.png',
      type: 'image/png',
      sizes: '144x144'
    },
    {
      url: '/icons/icon-192x192.png',
      type: 'image/png',
      sizes: '192x192'
    },
    {
      url: '/icons/icon-512x512.png',
      type: 'image/png',
      sizes: '512x512'
    }
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'StudySpace - Learn Together, Grow Together',
    description: 'Join StudySpace to connect with classmates, join study groups, share resources, and ace your exams together.',
    url: 'https://studyspace.example.com',
    siteName: 'StudySpace',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StudySpace - Collaborative Learning Platform'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudySpace - Learn Together, Grow Together',
    description: 'Join StudySpace to connect with classmates, join study groups, share resources, and ace your exams together.',
    images: ['/assets/og-image.png']
  }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-indigo-600 to-indigo-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
            Learn Together, <span className="bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">Grow Together</span>
          </h1>
          <p className="mb-8 text-lg sm:text-xl max-w-2xl mx-auto">
            StudySpace is a collaborative learning platform where students can connect, collaborate, and succeed together. Join study groups, share resources, and get help from peers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors">
              Get Started
            </Link>
            <Link href="/features" className="px-6 py-3 border border-white text-white hover:bg-white/20 rounded-lg transition-colors">
              Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-800">Features</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="mb-4 h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M5 3l6 6M9 17l6-6M5 3l6-6M9 17l-6 6" /></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Study Groups</h3>
              <p className="text-gray-600">Join or create study groups for any subject, collaborate on notes, and prepare for exams together.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="mb-4 h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2zm0 12c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2zm0-6c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2z"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Resource Sharing</h3>
              <p className="text-gray-600">Share notes, PDFs, links, and other study materials with your peers instantly.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="mb-4 h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 9a4.858 4.858 0 01-3.476-.937l-.367-.11a3.642 3.642 0 00-4.107-.208A3.991 3.991 0 013 11c0-2.206.895-4.22 2.212-5.41a2.012 2.012 0 011.144-2.9A4.003 4.003 0 017.5 3a4.003 4.003 0 014.036 1.318l.654.109a3.642 3.642 0 004.107-.209A4.858 4.858 0 0115 3c2.495 0 4.528 2.003 5.042 4.495a2.012 2.012 0 01.637 2.906A4.003 4.003 0 0115 11c0 2.206-.895 4.22-2.212 5.41A4.003 4.003 0 0110.5 14.682l-.367.11a3.642 3.642 0 00-4.107.207A4.858 4.858 0 019 3c-.618 0-1.12.5-1.12 1.125 0 .276.089.54.246.732a2.01 2.01 0 00-.392.545l-.46.069a2.012 2.012 0 01-.068 2.077z"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Real-time Chat</h3>
              <p className="text-gray-600">Chat instantly with classmates, react to messages, share files, and collaborate in real-time.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="mb-4 h-12 w-12 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2zm0 12c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2zm0-6c-1.1 0-2 .9-2 2s1 2 2 2 2-.9 2-2-1-2-2-2z"/></svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-800">Progress Tracking</h3>
              <p className="text-gray-600">Track your learning progress, set goals, and see how you improve over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-800">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">1</div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">Sign Up</h3>
                  <p className="text-gray-600">Create your free account using your email or school credentials.</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">2</div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">Join Study Groups</h3>
                  <p className="text-gray-600">Find or create study groups for your classes and interests.</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-600">3</div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">Collaborate & Learn</h3>
                  <p className="text-gray-600">Share resources, ask questions, and study together in real-time.</p>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Image src="/assets/how-it-works.svg" alt="How it works illustration" width={600} height={400} className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Start Learning Together?</h2>
          <p className="mb-10 text-lg max-w-2xl mx-auto">Join thousands of students who are already using StudySpace to improve their grades and make learning more enjoyable.</p>
          <Link href="/login" className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors inline-block">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-800 text-gray-200">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-white">StudySpace</h3>
              <p className="text-gray-400">The ultimate learning community platform for students.</p>
            </div>
            <div>
              <h4 className="mb-3 text-lg font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-lg font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-lg font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} StudySpace. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}