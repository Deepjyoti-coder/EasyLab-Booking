import React from 'react';
import { Home as HomeIcon, Users, CheckCircle, Zap, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Home({ onNavigate }) {
  const features = [
    {
      icon: <HomeIcon className="h-6 w-6 text-primary-600" />,
      title: "Home Sample Collection",
      description: "Our certified technicians collect samples right at your doorstep, saving you travel time and hassle."
    },
    {
      icon: <Users className="h-6 w-6 text-primary-600" />,
      title: "Experienced Staff",
      description: "Trained and compassionate phlebotomists ensure a painless, safe, and hygienic process."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary-600" />,
      title: "Accurate Testing",
      description: "All tests are processed in state-of-the-art facilities using highly accurate equipment."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary-600" />,
      title: "Fast Service",
      description: "Get digital test reports delivered securely to your device in record turnaround time."
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary-600" />,
      title: "Easy Online Booking",
      description: "A simple and straightforward online form lets you book in under a minute."
    }
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-slate-50 py-16 sm:py-24">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-primary-100/40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-success-50/50 blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 mb-6">
            <CheckCircle className="h-3.5 w-3.5" />
            Direct to Home Care
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Book Your <span className="text-primary-600">Home Sample</span> Collection
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Book diagnostic tests from the comfort of your home in just a few clicks. No waiting lines, no hassle.
          </p>

          <button
            onClick={() => onNavigate('book')}
            className="btn-primary flex items-center gap-2 mx-auto px-8 py-4 shadow-lg hover:shadow-primary-100 cursor-pointer"
          >
            <span>Book Test</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">Why Choose Us</h2>
          <div className="h-1.5 w-16 bg-primary-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">
            We are dedicated to providing the easiest, fastest, and most accurate diagnostic collection services.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="card bg-white p-6 hover:shadow-md hover:border-primary-100 transition-all duration-300 flex flex-col items-start"
            >
              <div className="bg-primary-50 p-3 rounded-2xl mb-5 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2.5">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
