"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DummyCheckoutButton({ orderId, amount }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDummyPay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, userId: "user_123", amount }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to success page
        router.push(data.redirectUrl || "/checkout/success");
      } else {
        alert("Payment simulation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDummyPay}
      disabled={loading}
      className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
    >
      {loading ? "Processing..." : "Dummy Pay"}
    </button>
  );
}
