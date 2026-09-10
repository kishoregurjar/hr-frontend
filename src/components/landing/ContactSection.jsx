"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MapPin, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactSection() {
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-[#e8f2fe]/70 border-t border-blue-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Get in Touch
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact Our HR Support Team
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Have questions about enterprise custom pipelines or onboarding? Reach out to us anytime.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Contact Info Cards */}
          <div className="space-y-3 sm:space-y-4">
            <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3 flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Email Us</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">support@hirequest.com</p>
                <p className="text-[11px] sm:text-xs text-slate-600">hr@hirequest.com</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3 flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Live Assistance</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">Available Mon-Fri 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm space-y-2 sm:space-y-3 flex items-start gap-4">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Location</h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">HireQuest Technologies, Tech Park</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 rounded-3xl border bg-white p-6 sm:p-8 shadow-sm">
            {contactSubmitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Message Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Thank you for reaching out. Our HR support team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Full Name</label>
                    <Input placeholder="Enter your name" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Work Email</label>
                    <Input type="email" placeholder="name@company.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <Input placeholder="e.g. Enterprise Custom Assessment Inquiry" required />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Message</label>
                  <Textarea
                    placeholder="Tell us about your organization's hiring and assessment needs..."
                    className="min-h-[100px] sm:min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
