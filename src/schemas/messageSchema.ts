import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Message must of 10 character" })
    .max(300, { message: "Message must of 300 character" }),
});
