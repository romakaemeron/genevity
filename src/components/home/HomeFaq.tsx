"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { FaqSchema } from "@/components/seo/FaqSchema";

const sectionTitle = {
  ua: "Часті запитання",
  ru: "Часто задаваемые вопросы",
  en: "Frequently Asked Questions",
};

const faqItems = [
  {
    question: {
      ua: "Які процедури пропонує центр естетичної медицини?",
      ru: "Какие процедуры предлагает центр эстетической медицины?",
      en: "What procedures does the aesthetic medicine center offer?",
    },
    answer: {
      ua: "GENEVITY пропонує повний спектр послуг: ін'єкційну косметологію (ботулінотерапія, контурна пластика, біоревіталізація, мезотерапія, PRP-терапія), апаратну косметологію (EMFACE, Ultraformer MPT, EMSCULPT NEO, HydraFacial, лазерну епіляцію Splendor X), longevity-програми (Check-Up 40+, IV-терапія, гормональний баланс), а також пластичну хірургію та діагностичні послуги.",
      ru: "GENEVITY предлагает полный спектр услуг: инъекционную косметологию (ботулинотерапия, контурная пластика, биоревитализация, мезотерапия, PRP-терапия), аппаратную косметологию (EMFACE, Ultraformer MPT, EMSCULPT NEO, HydraFacial, лазерную эпиляцию Splendor X), longevity-программы (Check-Up 40+, IV-терапия, гормональный баланс), а также пластическую хирургию и диагностические услуги.",
      en: "GENEVITY offers a full range of services: injectable cosmetology (botulinum therapy, contour plasty, biorevitalization, mesotherapy, PRP therapy), apparatus cosmetology (EMFACE, Ultraformer MPT, EMSCULPT NEO, HydraFacial, Splendor X laser hair removal), longevity programs (Check-Up 40+, IV therapy, hormonal balance), as well as plastic surgery and diagnostic services.",
    },
  },
  {
    question: {
      ua: "Як записатися на консультацію?",
      ru: "Как записаться на консультацию?",
      en: "How to book a consultation?",
    },
    answer: {
      ua: "Записатися на консультацію можна за телефоном +380 73 000 0150, через форму на сайті або безпосередньо у клініці за адресою вул. Олеся Гончара, 12, Дніпро. Наші адміністратори допоможуть обрати зручний час та підготують вас до візиту.",
      ru: "Записаться на консультацию можно по телефону +380 73 000 0150, через форму на сайте или непосредственно в клинике по адресу ул. Олеся Гончара, 12, Днепр. Наши администраторы помогут выбрать удобное время и подготовят вас к визиту.",
      en: "You can book a consultation by phone at +380 73 000 0150, through the website form, or directly at the clinic at 12 Olesia Honchara St., Dnipro. Our administrators will help you choose a convenient time and prepare for your visit.",
    },
  },
  {
    question: {
      ua: "Які кваліфікації мають ваші спеціалісти?",
      ru: "Какие квалификации имеют ваши специалисты?",
      en: "What qualifications do your specialists have?",
    },
    answer: {
      ua: "Лікарі GENEVITY мають вищу медичну освіту, спеціалізацію в дерматології, косметології та естетичній медицині, а також регулярно проходять навчання у провідних міжнародних клініках. Кожен спеціаліст має понад 10 років практичного досвіду та сертифікати від виробників обладнання (BTL, Lumenis, InMode).",
      ru: "Врачи GENEVITY имеют высшее медицинское образование, специализацию в дерматологии, косметологии и эстетической медицине, а также регулярно проходят обучение в ведущих международных клиниках. Каждый специалист имеет более 10 лет практического опыта и сертификаты от производителей оборудования (BTL, Lumenis, InMode).",
      en: "GENEVITY physicians hold higher medical degrees, specializations in dermatology, cosmetology, and aesthetic medicine, and regularly train at leading international clinics. Each specialist has over 10 years of practical experience and certifications from equipment manufacturers (BTL, Lumenis, InMode).",
    },
  },
  {
    question: {
      ua: "Чи є у вас акції або спеціальні пропозиції?",
      ru: "Есть ли у вас акции или специальные предложения?",
      en: "Do you have promotions or special offers?",
    },
    answer: {
      ua: "Так, GENEVITY регулярно пропонує спеціальні програми та сезонні акції. Для отримання актуальної інформації рекомендуємо зателефонувати нам або слідкувати за оновленнями на нашій сторінці в Instagram @genevity.center.",
      ru: "Да, GENEVITY регулярно предлагает специальные программы и сезонные акции. Для получения актуальной информации рекомендуем позвонить нам или следить за обновлениями на нашей странице в Instagram @genevity.center.",
      en: "Yes, GENEVITY regularly offers special programs and seasonal promotions. For up-to-date information, we recommend calling us or following updates on our Instagram page @genevity.center.",
    },
  },
  {
    question: {
      ua: "Які засоби використовуються під час процедур?",
      ru: "Какие средства используются во время процедур?",
      en: "What products are used during procedures?",
    },
    answer: {
      ua: "Ми використовуємо виключно сертифіковані препарати від світових лідерів: Allergan (Botox, Juvederm), Merz, Revitacare, а також власні longevity-протоколи на основі доказової медицини. Все обладнання — оригінальне, з діючими сертифікатами FDA та CE.",
      ru: "Мы используем исключительно сертифицированные препараты от мировых лидеров: Allergan (Botox, Juvederm), Merz, Revitacare, а также собственные longevity-протоколы на основе доказательной медицины. Всё оборудование — оригинальное, с действующими сертификатами FDA и CE.",
      en: "We use exclusively certified products from world leaders: Allergan (Botox, Juvederm), Merz, Revitacare, as well as our own evidence-based longevity protocols. All equipment is original with valid FDA and CE certifications.",
    },
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="body-strong text-black group-hover:text-main transition-colors pr-4">
          {question}
        </span>
        <motion.span
          className="text-muted text-2xl leading-none shrink-0"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="body-l text-muted pb-5 pr-8">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeFaq({ locale }: { locale: string }) {
  const l = locale as "ua" | "ru" | "en";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const localizedItems = faqItems.map((item) => ({
    question: item.question[l],
    answer: item.answer[l],
  }));

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-12">
      <FaqSchema items={localizedItems} />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="flex flex-col"
      >
        <motion.h2 variants={fadeInUp} className="heading-2 text-black mb-8">
          {sectionTitle[l]}
        </motion.h2>

        <motion.div variants={fadeInUp} className="border-t border-line">
          {localizedItems.map((item, i) => (
            <FaqItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
