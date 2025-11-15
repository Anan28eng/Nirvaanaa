// app/api/payment/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    const { orderId, userId, amount } = await req.json();

    console.log("💳 Dummy payment triggered for:", { orderId, userId, amount });

    await dbConnect();

    const fakePayment = {
      id: `pi_dummy_${Date.now()}`,
      status: "succeeded",
      amount_received: amount,
      currency: "usd",
      created: Date.now(),
    };

    await Order.findByIdAndUpdate(orderId, {
      status: "paid",
      paymentInfo: fakePayment,
    });

    return NextResponse.json({
      success: true,
      message: "Dummy payment successful",
      redirectUrl: `/checkout/success?orderId=${orderId}`,
    });
  } catch (error) {
    console.error("Dummy Payment Error:", error);
    return NextResponse.json(
      { success: false, message: "Dummy payment failed" },
      { status: 500 }
    );
  }
}

  