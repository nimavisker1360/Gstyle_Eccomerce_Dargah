import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  userId: string;
  orderId: string;
  amount: number; // Amount in Rial
  refId: string;
  authority: string;
  paymentDate: Date;
  status: "paid" | "refunded" | "cancelled";
  metadata: {
    order_id: string;
    user_id: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    refId: {
      type: String,
      required: true,
      unique: true,
    },
    authority: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "refunded", "cancelled"],
      default: "paid",
    },
    metadata: {
      order_id: {
        type: String,
        required: true,
      },
      user_id: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
