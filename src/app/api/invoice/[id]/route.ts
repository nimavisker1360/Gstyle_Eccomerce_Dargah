import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Invoice } from "@/lib/db/models/invoice.model";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find invoice by ID and ensure it belongs to the authenticated user
    const invoice = await Invoice.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invoice: {
        _id: invoice._id,
        orderId: invoice.orderId,
        amount: invoice.amount,
        refId: invoice.refId,
        authority: invoice.authority,
        paymentDate: invoice.paymentDate,
        status: invoice.status,
        metadata: invoice.metadata,
        createdAt: invoice.createdAt,
      },
    });
  } catch (error) {
    console.error("Fetch invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
