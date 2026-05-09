import { Link } from "react-router-dom";
import { Zap, Users, TrendingDown, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-indigo-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-indigo-600 sm:h-8 sm:w-8" />
              <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                SplitFlow
              </h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-center font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 sm:px-6"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-center font-medium text-white transition hover:shadow-lg sm:px-6"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
          <div>
            <h2 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Split expenses the{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                smart way
              </span>
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">
              Forget the guesswork. SplitFlow automatically calculates who owes whom and minimizes transactions. Perfect for roommates, friends, and group vacations.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-center font-medium text-white transition hover:shadow-lg"
              >
                Start Free
              </Link>
              <Link
                to="/login"
                className="rounded-lg border-2 border-indigo-600 px-8 py-3 text-center font-medium text-indigo-600 transition hover:bg-indigo-50"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 p-6 text-white shadow-premium sm:p-8">
            <div className="space-y-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <p className="text-sm opacity-90">Total spent</p>
                <p className="text-3xl font-bold">₹1,250</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <p className="text-sm opacity-90">You are owed</p>
                <p className="text-2xl font-bold text-green-300">+₹320</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <p className="text-sm opacity-90">You owe</p>
                <p className="text-2xl font-bold text-orange-300">-₹150</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:mb-12 sm:text-3xl">
            Why choose SplitFlow?
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Instantly calculate balances" },
              { icon: Users, title: "Easy Groups", desc: "Create and manage groups effortlessly" },
              { icon: TrendingDown, title: "Smart Settlement", desc: "Minimize transactions automatically" },
              { icon: Shield, title: "Secure", desc: "Your data is encrypted and safe" },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition text-center"
              >
                <feature.icon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
            Ready to split smarter?
          </h3>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:shadow-lg transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
