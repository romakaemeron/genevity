import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "qzct6skk",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const ls = (uk: string, ru: string, en: string) => ({ _type: "localeString" as const, uk, ru, en });

// Prices from technical_task/Загальний прайс_косметологія.xlsx
const servicePrices: Record<string, { priceFrom: ReturnType<typeof ls>; priceUnit: ReturnType<typeof ls> }> = {
  // Injectable
  "service-botulinum-therapy": { priceFrom: ls("від 2 000 грн", "от 2 000 грн", "from 2,000 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-contour-plasty": { priceFrom: ls("від 8 200 грн", "от 8 200 грн", "from 8,200 UAH"), priceUnit: ls("за шприц", "за шприц", "per syringe") },
  "service-biorevitalisation": { priceFrom: ls("від 4 500 грн", "от 4 500 грн", "from 4,500 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-mesotherapy": { priceFrom: ls("від 1 000 грн", "от 1 000 грн", "from 1,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-prp-therapy": { priceFrom: ls("від 4 000 грн", "от 4 000 грн", "from 4,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-exosomes": { priceFrom: ls("від 14 000 грн", "от 14 000 грн", "from 14,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-stem-cell-therapy": { priceFrom: ls("від 40 000 грн", "от 40 000 грн", "from 40,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-rejuran": { priceFrom: ls("від 4 600 грн", "от 4 600 грн", "from 4,600 UAH"), priceUnit: ls("за 1 мл", "за 1 мл", "per 1 ml") },
  "service-juvederm": { priceFrom: ls("від 6 200 грн", "от 6 200 грн", "from 6,200 UAH"), priceUnit: ls("за шприц", "за шприц", "per syringe") },
  "service-polyphil": { priceFrom: ls("від 7 500 грн", "от 7 500 грн", "from 7,500 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  // Apparatus
  "service-emface": { priceFrom: ls("від 5 000 грн", "от 5 000 грн", "from 5,000 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-volnewmer": { priceFrom: ls("від 9 500 грн", "от 9 500 грн", "from 9,500 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-exion": { priceFrom: ls("від 2 000 грн", "от 2 000 грн", "from 2,000 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-ultraformer-mpt": { priceFrom: ls("від 5 000 грн", "от 5 000 грн", "from 5,000 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-emsculpt-neo": { priceFrom: ls("від 4 500 грн", "от 4 500 грн", "from 4,500 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-ultraformer-mpt-body": { priceFrom: ls("від 22 000 грн", "от 22 000 грн", "from 22,000 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-exion-body": { priceFrom: ls("від 2 350 грн", "от 2 350 грн", "from 2,350 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-m22-stellar-black": { priceFrom: ls("від 1 400 грн", "от 1 400 грн", "from 1,400 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-splendor-x": { priceFrom: ls("від 200 грн", "от 200 грн", "from 200 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-hydrafacial": { priceFrom: ls("від 4 000 грн", "от 4 000 грн", "from 4,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-acupulse-co2": { priceFrom: ls("від 1 500 грн", "от 1 500 грн", "from 1,500 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  // Intimate
  "service-monopolar-rf-lifting": { priceFrom: ls("від 1 600 грн", "от 1 600 грн", "from 1,600 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-acupulse-co2-intimate": { priceFrom: ls("від 8 000 грн", "от 8 000 грн", "from 8,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  // Laser
  "service-laser-men": { priceFrom: ls("від 200 грн", "от 200 грн", "from 200 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  "service-laser-women": { priceFrom: ls("від 200 грн", "от 200 грн", "from 200 UAH"), priceUnit: ls("за зону", "за зону", "per zone") },
  // Longevity
  "service-check-up-40": { priceFrom: ls("за консультацією", "по консультации", "by consultation"), priceUnit: ls("програма", "программа", "program") },
  "service-longevity-program": { priceFrom: ls("за консультацією", "по консультации", "by consultation"), priceUnit: ls("програма", "программа", "program") },
  "service-hormonal-balance": { priceFrom: ls("від 950 грн", "от 950 грн", "from 950 UAH"), priceUnit: ls("консультація", "консультация", "consultation") },
  "service-iv-therapy": { priceFrom: ls("від 20 000 грн", "от 20 000 грн", "from 20,000 UAH"), priceUnit: ls("за процедуру", "за процедуру", "per procedure") },
  "service-nutraceuticals": { priceFrom: ls("від 1 000 грн", "от 1 000 грн", "from 1,000 UAH"), priceUnit: ls("консультація", "консультация", "consultation") },
};

async function main() {
  for (const [id, data] of Object.entries(servicePrices)) {
    await client.patch(id)
      .set({ priceFrom: data.priceFrom, priceUnit: data.priceUnit })
      .commit();
    console.log(`✓ ${id}`);
  }

  // Update priceTeaser sections with real price references
  // Injectable: від 1 000 грн
  await client.patch("category-injectable-cosmetology")
    .set({
      "sections[_key==\"price\"].intro": {
        _type: "localeText",
        uk: "Вартість ін'єкційних процедур залежить від типу препарату, обсягу корекції та зони обробки. Ціни починаються від 1 000 грн за процедуру мезотерапії до 40 000 грн за терапію стовбуровими клітинами. Для точного розрахунку запишіться на безкоштовну консультацію.",
        ru: "Стоимость инъекционных процедур зависит от типа препарата, объёма коррекции и зоны обработки. Цены начинаются от 1 000 грн за процедуру мезотерапии до 40 000 грн за терапию стволовыми клетками. Для точного расчёта запишитесь на бесплатную консультацию.",
        en: "Injectable procedure pricing depends on the product type, correction volume and treatment area. Prices start from 1,000 UAH for mesotherapy up to 40,000 UAH for stem cell therapy. Book a free consultation for an exact calculation.",
      },
    })
    .commit();
  console.log("✓ Updated injectable priceTeaser with real prices");

  // Apparatus: від 1 400 грн
  await client.patch("category-apparatus-cosmetology")
    .set({
      "sections[_key==\"price\"].intro": {
        _type: "localeText",
        uk: "Вартість апаратних процедур залежить від зони обробки, типу обладнання та кількості сеансів. Ціни починаються від 1 400 грн за фотоомолодження M22 до 75 000 грн за повне обличчя Volnewmer. Для точного розрахунку запишіться на безкоштовну консультацію.",
        ru: "Стоимость аппаратных процедур зависит от зоны обработки, типа оборудования и количества сеансов. Цены начинаются от 1 400 грн за фотоомоложение M22 до 75 000 грн за полное лицо Volnewmer. Для точного расчёта запишитесь на бесплатную консультацию.",
        en: "Apparatus procedure pricing depends on the treatment area, equipment type and number of sessions. Prices start from 1,400 UAH for M22 photorejuvenation up to 75,000 UAH for full face Volnewmer. Book a free consultation for an exact calculation.",
      },
    })
    .commit();
  console.log("✓ Updated apparatus priceTeaser with real prices");

  console.log("\n✅ All prices seeded from technical task pricing data!");
}

main().catch(console.error);
