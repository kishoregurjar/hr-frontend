"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do game-based assessments evaluate candidates?",
    answer:
      "Game-based assessments measure core cognitive traits such as working memory, spatial reasoning, numerical reaction speed, and logical deduction under timed conditions.",
  },
  {
    question: "Can HR customize question and game weightage?",
    answer:
      "Yes! HR recruiters can adjust quiz weightage (e.g. 40%) and game weightage (e.g. 60%) in the Assessment Settings step to match role requirements.",
  },
  {
    question: "Are tab switches recorded during candidate tests?",
    answer:
      "Yes. HireQuest non-punitively tracks tab switches, window blur events, and fullscreen exits, presenting an Integrity Signal Summary for HR review.",
  },
  {
    question: "How long are candidate assessment links valid?",
    answer:
      "Candidate invitation links are valid for 3 days by default. HR can easily resend expired links to generate a new valid token.",
  },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className="bg-white/80 py-14 sm:py-20 border-t border-blue-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Everything you need to know about candidate assessments and pipeline workflows.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border bg-card overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs sm:text-sm md:text-base text-slate-900 hover:text-blue-600 gap-3"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
