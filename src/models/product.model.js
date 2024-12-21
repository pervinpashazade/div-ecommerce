import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    raiting: {
        type: Number,
        required: false,
        default: 0
    },
    reviewCount: {
        type: Number,
        required: false,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
        required: false
    },
    countInStock: {
        type: Number,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false
    }],
    tags: [{
        type: String,
        required: false
    }],
    mainImg: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: false
    }],
})