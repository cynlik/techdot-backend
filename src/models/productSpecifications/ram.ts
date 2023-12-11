import mongoose, { Document, Schema, model } from "mongoose";

interface IMotherboardSpecifications {
    manufacturer?: string;
    chipset?: string;
    formFactor?: string;
}