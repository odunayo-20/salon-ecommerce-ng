import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/flutterwave";
import { prisma } from "@/lib/prisma";
import { sendEmail, orderConfirmationEmail } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, tx_ref } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );
    }

    const verification = await verifyTransaction(transaction_id);

    if (verification.data?.status === "successful") {
      const { orderId, appointmentId, type } = verification.data.meta || {};

      if (type === "appointment" && appointmentId) {
        await prisma.payment.updateMany({
          where: { reference: tx_ref },
          data: {
            status: "PAID",
            providerRef: transaction_id,
            paidAt: new Date(),
          },
        });

        await prisma.appointment.update({
          where: { id: appointmentId },
          data: { status: "CONFIRMED" },
        });
      } else if (orderId) {
        await prisma.payment.updateMany({
          where: { reference: tx_ref },
          data: {
            status: "PAID",
            providerRef: transaction_id,
            paidAt: new Date(),
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        });

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            items: true,
            customerProfile: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        });

        if (order?.customerProfile?.user?.email) {
          try {
            await sendEmail({
              to: order.customerProfile.user.email,
              subject: `Order Confirmed — ${order.orderNumber}`,
              html: orderConfirmationEmail({
                customerName: order.customerProfile.user.name || "Valued Customer",
                orderNumber: order.orderNumber,
                items: order.items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: Number(item.price),
                })),
                total: Number(order.total),
                shippingAddress: order.shippingAddress || "",
              }),
            });
          } catch {
            // Email failure
          }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Payment not successful" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
