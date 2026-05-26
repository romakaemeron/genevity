import { z } from "zod";
import { helyosSql } from "@/lib/db/helyos";

export const helyosTools = {
  searchHelyosServices: {
    description:
      "Search Helyos clinic services and medical directions by keyword. Use when patient asks about something outside Genevity's profile: surgery, cardiology, oncology, IVF, diagnostics, etc.",
    inputSchema: z.object({
      query: z.string().describe("Search keyword in Ukrainian or Russian"),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        const rows = await helyosSql`
          SELECT id, title_uk AS title, description_uk AS description,
                 price_from_uk AS price_from
          FROM services
          WHERE title_uk ILIKE ${"%" + query + "%"}
             OR description_uk ILIKE ${"%" + query + "%"}
          LIMIT 5
        `;
        if (!rows.length) return { results: [], note: "Нічого не знайдено: " + query };
        return { results: rows };
      } catch {
        return { results: [], note: "Помилка пошуку в Helyos" };
      }
    },
  },

  searchHelyosDoctors: {
    description:
      "Find Helyos doctors by specialty. Use when patient asks about a specific medical specialty at Helyos.",
    inputSchema: z.object({
      specialty: z.string().describe("Specialty in Ukrainian/Russian, e.g. кардіолог, хірург"),
    }),
    execute: async ({ specialty }: { specialty: string }) => {
      try {
        const rows = await helyosSql`
          SELECT name_uk AS name, role_uk AS role
          FROM doctors
          WHERE role_uk ILIKE ${"%" + specialty + "%"}
             OR name_uk  ILIKE ${"%" + specialty + "%"}
          LIMIT 5
        `;
        if (!rows.length) return { doctors: [], note: "Лікарів не знайдено" };
        return { doctors: rows };
      } catch {
        return { doctors: [], note: "Помилка пошуку лікарів Helyos" };
      }
    },
  },

  getHelyosServiceDetail: {
    description:
      "Get full details of a specific Helyos service by its ID. Use after searchHelyosServices when the patient wants more detail.",
    inputSchema: z.object({
      serviceId: z.string().describe("Service ID from searchHelyosServices result"),
    }),
    execute: async ({ serviceId }: { serviceId: string }) => {
      try {
        const rows = await helyosSql`
          SELECT s.id, s.title_uk AS title, s.description_uk AS description,
                 s.price_from_uk AS price_from, c.title_uk AS category
          FROM services s
          LEFT JOIN service_categories c ON s.category_id = c.id
          WHERE s.id = ${serviceId}
          LIMIT 1
        `;
        if (!rows[0]) return { service: null, note: "Послугу не знайдено" };
        return { service: rows[0] };
      } catch {
        return { service: null, note: "Помилка отримання деталей Helyos" };
      }
    },
  },
} as const;
