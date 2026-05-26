import { neon } from "@neondatabase/serverless";

export const helyosSql = neon(process.env.HELYOS_DATABASE_URL!);
