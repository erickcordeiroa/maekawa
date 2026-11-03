import { z } from "zod"
import { phoneField } from "./phone"

export const checkinSchema = z.object({ phone: phoneField() })
export type CheckinInput = z.infer<typeof checkinSchema>
