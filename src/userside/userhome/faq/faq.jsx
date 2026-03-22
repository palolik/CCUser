import { useState } from "react";

const Faq = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-24 px-6 bg-gray-50">

      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs tracking-[3px] uppercase text-blue-500 font-medium mb-4">Got Questions?</p>
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight max-w-xl mx-auto"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Frequently{" "}
          <em className="italic text-blue-500">Asked Questions</em>
        </h2>
      </div>

      {/* FAQ list */}
      <div className=" lg:mx-32 flex flex-col gap-3">
        {faqs && faqs.length > 0 ? (
          faqs.map((faq, i) => (
            <div key={faq._id}
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 ${
                openIndex === i
                  ? "border-blue-200 shadow-lg shadow-blue-500/08"
                  : "border-gray-200 hover:border-gray-300"
              }`}>

              {/* Question button */}
              <button onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                <span className={`text-sm font-medium leading-snug transition-colors ${
                  openIndex === i ? "text-blue-700" : "text-gray-900"
                }`}>
                  {faq.faqquestion}
                </span>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm transition-all duration-300 ${
                  openIndex === i
                    ? "bg-blue-100 text-blue-600 rotate-45"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  +
                </div>
              </button>

              {/* Answer */}
              <div className={`transition-all duration-300 overflow-hidden ${
                openIndex === i ? "max-h-96" : "max-h-0"
              }`}>
                <div className="px-6 pb-5 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-light leading-relaxed pt-4">
                    {faq.faqanswer}
                  </p>
                </div>
              </div>

            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 font-light py-10">No FAQs available.</p>
        )}
      </div>
    </section>
  );
};

export default Faq;