import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentRequest extends Document {
  userId: string;
  orderId: string;
  amount: number; // Amount in Rial
  description: string;
  authority: string;
  refId?: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  errorDetails?: string;
  verifiedAt?: Date;
  metadata: {
    order_id: string;
    user_id: string;
    email?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>(
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
    description: {
      type: String,
      required: true,
    },
    authority: {
      type: String,
      required: true,
      unique: true,
    },
    refId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    errorDetails: {
      type: String,
    },
    verifiedAt: {
      type: Date,
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

export const PaymentRequest =
  mongoose.models.PaymentRequest ||
  mongoose.model<IPaymentRequest>("PaymentRequest", PaymentRequestSchema);
