"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { fadeInUp, viewportConfig } from "@/lib/motion";

interface CTAFormProps {
  variant?: "default" | "alt";
  ui: {
    title: string;
    titleAlt: string;
    name: string;
    phone: string;
    submit: string;
    success: string;
  };
}

export default function CTAForm({ variant = "default", ui }: CTAFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section
      id="booking"
      className="max-w-(--container-max) md:mx-auto px-4 sm:px-6 lg:px-(--container-padding)"
    >
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        <h2 className="heading-2 text-black mb-8">
          {variant === "alt" ? ui.titleAlt : ui.title}
        </h2>

        {submitted ? (
          <motion.p
            className="body-l text-success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {ui.success}
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:max-w-md">
            <input
              type="text"
              placeholder={ui.name}
              required
              className="bg-main/10 text-black placeholder:text-black-40 px-4 py-3 rounded-(--radius-input) body-m outline-none border border-main/0 hover:border-main/50 focus:border-main focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,123,107,0.1)] transition-all duration-200"
            />
            <input
              type="tel"
              placeholder={ui.phone}
              required
              className="bg-main/10 text-black placeholder:text-black-40 px-4 py-3 rounded-(--radius-input) body-m outline-none border border-main/0 hover:border-main/50 focus:border-main focus:bg-white focus:shadow-[0_0_0_3px_rgba(139,123,107,0.1)] transition-all duration-200"
            />
            <div className="mt-2">
              <Button variant="secondary" type="submit">
                {ui.submit}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </section>
  );
}
