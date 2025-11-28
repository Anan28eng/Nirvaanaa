"use client";
import React from "react";
import { Playfair_Display, Inter } from "next/font/google";
import { motion } from "framer-motion";

const playfair = Playfair_Display({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"], weight: "400" });

export default function ReturnsPageClient() {
  return (
    <main className="min-h-screen bg-nirvaanaa-offwhite px-4 py-8 flex flex-col items-center">
      <h1
        className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6 text-center text-gradient-to-r from-[rgb(165,227,249)] to-[rgb(7,30,201)]`}
      >
        <motion.span
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Return & Cancellation Policy
        </motion.span>
      </h1>

      <div className="max-w-2xl w-full glassmorphism p-6 rounded-xl shadow-lg mb-8">
        <p
          className={`${inter.className} mb-4 italic text-[#7c6a58]`}
        >
          At NIRVAANAA we believe in supporting our customers with fairness
          and care. Our cancellation and return policy is crafted to ensure a
          smooth, compassionate, and transparent experience.
        </p>

        <div className="divider my-6" />

        {/* CANCELLATION POLICY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`${playfair.className} text-2xl mb-3`}>
            Cancellation Policy
          </h2>
          <div className={`${inter.className} space-y-4 text-[#4b453f]`}>
            <p>
              Cancellations will be considered only if the request is made
              within <strong>15 days</strong> of placing the order. However, the
              cancellation request may not be accepted if the order has already
              been communicated to the vendor or has entered the shipping
              process.
            </p>

            <p>
              MANJU KALYAN does not accept cancellation requests for perishable
              items such as flowers or food products. However, a refund or
              replacement may be provided if the customer clearly establishes
              that the delivered product was of poor quality.
            </p>
          </div>
        </motion.div>

        <div className="divider my-6" />

        {/* DAMAGED OR DEFECTIVE ITEMS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className={`${playfair.className} text-2xl mb-3`}>
            Damaged or Defective Products
          </h2>
          <div className={`${inter.className} space-y-4 text-[#4b453f]`}>
            <p>
              If you receive a damaged or defective item, please report it to
              our Customer Service team within <strong>15 days</strong> of
              receipt. The request will be processed only after the merchant
              verifies and confirms the issue from their end.
            </p>
          </div>
        </motion.div>

        <div className="divider my-6" />

        {/* PRODUCT DIFFERENCE OR EXPECTATION ISSUES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className={`${playfair.className} text-2xl mb-3`}>
            Product Not as Expected
          </h2>
          <div className={`${inter.className} space-y-4 text-[#4b453f]`}>
            <p>
              If you feel that the product received is not as shown on the
              website or does not meet your expectations, please notify our
              Customer Service team within <strong>15 days</strong> of delivery.
              After reviewing your concern, the team will make an appropriate
              decision.
            </p>
          </div>
        </motion.div>

        <div className="divider my-6" />

        {/* WARRANTY CLAIMS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className={`${playfair.className} text-2xl mb-3`}>
            Warranty-Related Issues
          </h2>
          <div className={`${inter.className} text-[#4b453f]`}>
            <p>
              For products that include a manufacturer’s warranty, customers are
              requested to contact the respective manufacturer directly for
              support or replacement.
            </p>
          </div>
        </motion.div>

        <div className="divider my-6" />

        {/* REFUNDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className={`${playfair.className} text-2xl mb-3`}>
            Refunds
          </h2>
          <div className={`${inter.className} text-[#4b453f]`}>
            <p>
              Once approved, refunds by NIRVAANAA will be processed within{" "}
              <strong>3–5 days</strong> to the customer’s original payment
              method.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bottom Wave */}
      <svg
        width="100%"
        height="40"
        viewBox="0 0 1440 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
        aria-hidden="true"
      >
        <path
          d="M0,20 C480,60 960,-20 1440,20 L1440,40 L0,40 Z"
          fill="#e3e0d9"
        />
      </svg>
    </main>
  );
}


