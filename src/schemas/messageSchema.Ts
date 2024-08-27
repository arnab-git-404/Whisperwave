import {z} from "zod";

export const messageSchema = z.object({
    content : z.string()
    .min(10, 'Message must be at least 10 characters long')
    .max(100, 'Message must be no loger than 100 characters long')

}) 