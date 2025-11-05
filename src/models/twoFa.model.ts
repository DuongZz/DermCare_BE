import { I2FA } from "@/interfaces/models/twoFa.interface";
import { Schema, model } from "mongoose";

const TwoFASchema = new Schema<I2FA>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TwoFASchema.index({ userId: 1 }, { unique: true });

export const TwoFA = model<I2FA>(
  'TwoFA',
  TwoFASchema
)
