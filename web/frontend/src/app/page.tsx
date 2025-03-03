import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-slate-700 to-slate-600">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to KnowledgeShare
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            A decentralized platform where students and teachers own, share, and discover academic resources in a trustless, transparent ecosystem.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <Shield className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">True Ownership</h3>
              <p className="text-slate-600">
                Retain full control of your intellectual property through blockchain-based authentication.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Direct Monetization</h3>
              <p className="text-slate-600">
                Earn rewards through smart contracts when your content is accessed or shared.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <Users className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Governance</h3>
              <p className="text-slate-600">
                Participate in platform decisions through our DAO model.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers & Students */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">For Teachers</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span>Create and publish tokenized educational content</span>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span>Earn rewards through automated smart contracts</span>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">For Students</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <span>Access verified and immutable study materials</span>
                </li>
                <li className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-2 mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span>Engage in community discussions and reviews</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-primary">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join the Educational Revolution
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Be part of a community that's reshaping the future of education through decentralized learning.
          </p>
          <Button size="lg" variant="secondary">
            Join KnowledgeShare Today
          </Button>
        </div>
      </section>
    </div>
  );
}
