import { z } from 'zod';

 const createProductValidationSchema = z.object({
     body: z.object({
         title: z.string().min(1, { message: "Title is required" }),
         address: z.string().min(1, { message: "Address is required" }),
         location: z.string().min(1, { message: "City is required" }),
         description: z.string().min(1, { message: "Description is required" }),
         price: z.number().min(0, { message: "Price must be a positive number" }),
         condition: z.enum(["new", "used"], { message: "Condition must be 'new' or 'used'" }),
         status: z.enum(["available", "sold"]).default("available").optional(),
    })
});
export const productValidation = {
    createProductValidationSchema
}
