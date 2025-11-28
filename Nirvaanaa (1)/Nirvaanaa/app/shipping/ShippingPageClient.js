"use client";
import React from "react";
import { Playfair_Display, Inter } from "next/font/google";
import { motion } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"], weight: "400" });

const quotes = [
  "Artisan hands shape the journey, as time weaves its gentle thread.",
  "Across lands and oceans, your treasures travel with care and poetry.",
  "Every parcel, a promise carried on wings of trust.",
];

export default function ShippingPageClient() {
  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <h1
        className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#bfae9e] to-[#7c6a58]`}
      >
        <motion.span
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Shipping Policy
        </motion.span>
      </h1>

      {/* Card */}
      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        {/* International Policy */}
        <h2 className={`${playfair.className} text-2xl mb-2`}>
          International Shipping
        </h2>
        <p className={`${inter.className} mb-4`}>
          For international buyers, orders are shipped and delivered through
          registered international courier companies and/or International Speed
          Post only. Delivery timelines depend on the courier partner and the
          destination country’s customs processing times.
        </p>

        <div className="divider my-6" />

        {/* Domestic Policy */}
        <h2 className={`${playfair.className} text-2xl mb-2`}>
          Domestic Shipping
        </h2>
        <p className={`${inter.className} mb-4`}>
          For domestic buyers, orders are shipped through registered domestic
          courier companies and/or Speed Post only. Delivery timelines follow
          the respective courier company or postal service norms.
        </p>

        <div className="divider my-6" />

        {/* Dispatch Timelines */}
        <h2 className={`${playfair.className} text-2xl mb-2`}>
          Dispatch Timelines
        </h2>
        <p className={`${inter.className} mb-4`}>
          Orders are shipped within <strong>8–14 days</strong> or as per the
          agreed delivery timeline at the time of order confirmation. MANJU
          KALYAN guarantees dispatch to the courier company or postal
          authorities within this timeframe.
        </p>
        <p className={`${inter.className} mb-4`}>
          However, MANJU KALYAN is <strong>not liable</strong> for delays caused
          by courier companies, postal services, customs, or other external
          factors beyond our control.
        </p>

        <div className="divider my-6" />

        {/* Delivery Address */}
        <h2 className={`${playfair.className} text-2xl mb-2`}>
          Delivery Address & Confirmation
        </h2>
        <p className={`${inter.className} mb-4`}>
          All orders will be delivered to the address provided by the buyer at
          checkout. Confirmation of dispatch and delivery will be shared to your
          registered email ID.
        </p>

        <div className="divider my-6" />

        {/* Support */}
        <h2 className={`${playfair.className} text-2xl mb-2`}>
          Customer Support
        </h2>
        <p className={`${inter.className}`}>
          For any issues in using our services, please reach out to our helpdesk
          at <strong>7763853089</strong> or{" "}
          <strong>libramank@gmail.com</strong>.
        </p>
      </div>

      {/* Quotes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xl mb-8"
      >
        <div className="flex flex-col gap-4">
          {quotes.map((quote, idx) => (
            <motion.div
              key={idx}
              className="bg-[#f7f4ed] rounded-lg p-4 shadow-md border-l-4 border-[#bfae9e]"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 * idx }}
            >
              <span
                className={`${playfair.className} italic text-lg text-[#7c6a58]`}
              >
                {quote}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Decorative Wave */}
      <svg
        width="100%"
        height="40"
        viewBox="0 0 1440 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
        aria-hidden="true"
      >
        <path d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z" fill="#e3e0d9" />
      </svg>
    </main>
  );
}


