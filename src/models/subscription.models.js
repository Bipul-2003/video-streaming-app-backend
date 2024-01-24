import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const SubscriptionSchema = new Schema({
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    subscribers: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }


}, { timestamps: true })

export const Subscription = model("Subscription", SubscriptionSchema)