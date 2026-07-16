/**
 * Seed: RU + EN bodies for the two legal docs that were seeded UK-only —
 * `quality-policy` (Політика якості) and `public-offer` (Договір публічної оферти).
 *
 * Companion to seed-quality-policy-and-contract.ts: that script set body_uk and
 * left body_ru / body_en NULL. This one fills them in (faithful translations,
 * structure and requisites preserved). UK is left untouched.
 *
 * Run: npx tsx scripts/seed-legal-translations-ru-en.ts
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";

const envContent = fs.readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((l) => {
  const [k, ...v] = l.split("=");
  if (k && v.length) env[k.trim()] = v.join("=").trim();
});

const sql = postgres(env.DATABASE_URL!);

/* ========== 1. ПОЛІТИКА ЯКОСТІ ========== */

const qualityPolicyRu = `ПОЛИТИКА МЕДИЦИНСКОГО ЦЕНТРА GENEVITY
ФЛП Харьковская Екатерина Сергеевна
В СФЕРЕ КАЧЕСТВА

Девиз: Современная медицина долголетия, персонализированный подход и высокие стандарты сервиса — основа здоровья, красоты и качества жизни.

Медицинский центр GENEVITY — современный premium medical & longevity center, который объединяет возможности превентивной, anti-age, эстетической и персонализированной медицины с современными технологиями диагностики, лечения и восстановления организма.

GENEVITY является примером сочетания профессиональной медицинской экспертизы, инновационных технологий, современного оборудования и высоких стандартов сервиса. Мы ценим доверие наших пациентов, партнёров и сотрудников. Каждый пациент для нас уникален, а главным приоритетом деятельности Центра является безопасность, качество медицинской помощи, этичность и персонализированный подход.

Миссия: Мы способствуем формированию культуры ответственного отношения к здоровью, долголетию и качеству жизни путём предоставления современной, безопасной, персонализированной и доказательной медицинской помощи.

1.ЦЕЛЬ ПОЛИТИКИ В СФЕРЕ КАЧЕСТВА

Обеспечение высокого уровня медицинского обслуживания и сервиса путём предоставления безопасных, качественных, эффективных и персонализированных медицинских, диагностических, anti-age, эстетических и wellness-услуг в соответствии с требованиями законодательства Украины, международными стандартами и ожиданиями пациентов.

2.ОСНОВНЫЕ ЗАДАЧИ В СФЕРЕ КАЧЕСТВА

обеспечение соответствия деятельности Медицинского центра требованиям действующего законодательства Украины в сфере здравоохранения, лицензионным условиям и международным стандартам управления качеством
внедрение и постоянное совершенствование системы управления качеством в соответствии с требованиями ISO 9001:2015 «Системы управления качеством. Требования»
обеспечение высокого качества медицинских, диагностических, консультативных, эстетических и восстановительных услуг
обеспечение безопасности пациентов на всех этапах оказания медицинской помощи и проведения процедур
внедрение современных методов превентивной, anti-age и персонализированной медицины в соответствии с принципами доказательной медицины
обеспечение этичности, медицинской обоснованности и профессиональной ответственности при формировании индивидуальных программ лечения, восстановления и долголетия
обеспечение конфиденциальности медицинской информации и надлежащей защиты персональных данных пациентов
формирование высокого уровня premium-сервиса, пациентоориентированной коммуникации и индивидуального сопровождения пациентов
обеспечение надлежащего документирования медицинских процедур, информированных согласий и медицинских вмешательств
систематическое повышение профессиональной компетентности медицинского и административного персонала
обеспечение эффективного внутреннего контроля качества медицинских и сервисных процессов
развитие культуры личной ответственности работников за качество медицинской помощи и безопасность пациентов
внедрение риск-ориентированного подхода при организации деятельности Центра и оказании медицинских услуг
обеспечение надлежащих, безопасных и комфортных условий для пациентов и работников
постоянное совершенствование медицинских технологий, оборудования и цифровых сервисов Центра
соблюдение принципов профессиональной этики, добропорядочности, социальной ответственности и конфиденциальности

3.ПУТИ ДОСТИЖЕНИЯ РЕЗУЛЬТАТОВ

активное участие руководства Медицинского центра в функционировании и совершенствовании системы управления качеством
внедрение современных медицинских информационных систем и автоматизации внутренних процессов
постоянный анализ результативности деятельности и мониторинг удовлетворённости пациентов
использование современного сертифицированного медицинского оборудования и технологий
обеспечение контроля качества медицинских, эстетических и диагностических процедур
организация непрерывного профессионального развития персонала, обучения и повышения квалификации
обеспечение надлежащего технического обслуживания медицинского оборудования и контроля его безопасного использования
привлечение к сотрудничеству исключительно квалифицированных партнёров, поставщиков и подрядчиков
обеспечение открытой, профессиональной и этичной коммуникации с пациентами
обеспечение надлежащего оформления медицинской документации и информированных согласий
внедрение современных подходов к управлению рисками и непрерывности деятельности Центра
соблюдение санитарно-эпидемиологических требований, требований охраны труда и экологической безопасности
постоянное совершенствование качества медицинских и сервисных процессов путём внедрения инновационных технологий и международных практик

Руководство Медицинского центра GENEVITY берёт на себя ответственность за реализацию настоящей Политики в сфере качества, обеспечение эффективного функционирования системы управления качеством, непрерывное совершенствование процессов, поддержание высоких стандартов медицинской помощи и формирование долгосрочного доверия пациентов и партнёров.`;

const qualityPolicyEn = `QUALITY POLICY OF THE GENEVITY MEDICAL CENTER
Individual Entrepreneur Kateryna Serhiivna Kharkivska

Motto: Modern longevity medicine, a personalised approach, and high service standards are the foundation of health, beauty, and quality of life.

The GENEVITY medical center is a modern premium medical & longevity center that combines the capabilities of preventive, anti-age, aesthetic, and personalised medicine with advanced technologies for diagnostics, treatment, and recovery of the body.

GENEVITY is an example of combining professional medical expertise, innovative technologies, modern equipment, and high service standards. We value the trust of our patients, partners, and employees. Every patient is unique to us, and the main priority of the Center's work is safety, quality of medical care, ethics, and a personalised approach.

Mission: We help build a culture of responsible attitude towards health, longevity, and quality of life by providing modern, safe, personalised, and evidence-based medical care.

1.PURPOSE OF THE QUALITY POLICY

To ensure a high level of medical care and service by providing safe, high-quality, effective, and personalised medical, diagnostic, anti-age, aesthetic, and wellness services in accordance with the requirements of Ukrainian legislation, international standards, and patient expectations.

2.KEY QUALITY OBJECTIVES

ensuring that the Medical Center's activities comply with the requirements of current Ukrainian healthcare legislation, licensing conditions, and international quality management standards
implementing and continuously improving the quality management system in accordance with ISO 9001:2015 "Quality management systems. Requirements"
ensuring the high quality of medical, diagnostic, consultative, aesthetic, and restorative services
ensuring patient safety at every stage of medical care and procedures
introducing modern methods of preventive, anti-age, and personalised medicine in line with evidence-based medicine
ensuring the ethics, medical justification, and professional responsibility when designing individual treatment, recovery, and longevity programmes
ensuring the confidentiality of medical information and proper protection of patients' personal data
delivering a high level of premium service, patient-centred communication, and individual patient support
ensuring proper documentation of medical procedures, informed consents, and medical interventions
systematically improving the professional competence of medical and administrative staff
ensuring effective internal quality control of medical and service processes
developing a culture of personal responsibility among staff for the quality of medical care and patient safety
applying a risk-based approach to organising the Center's activities and providing medical services
ensuring appropriate, safe, and comfortable conditions for patients and staff
continuously improving the Center's medical technologies, equipment, and digital services
observing the principles of professional ethics, integrity, social responsibility, and confidentiality

3.WAYS OF ACHIEVING RESULTS

active involvement of the Medical Center's management in operating and improving the quality management system
implementing modern medical information systems and automating internal processes
continuously analysing performance and monitoring patient satisfaction
using modern, certified medical equipment and technologies
ensuring quality control of medical, aesthetic, and diagnostic procedures
organising continuous professional development, training, and upskilling of staff
ensuring proper maintenance of medical equipment and control of its safe use
collaborating exclusively with qualified partners, suppliers, and contractors
ensuring open, professional, and ethical communication with patients
ensuring proper completion of medical records and informed consents
applying modern approaches to risk management and business continuity of the Center
complying with sanitary and epidemiological requirements, occupational health and safety, and environmental safety
continuously improving the quality of medical and service processes by adopting innovative technologies and international practices

The management of the GENEVITY medical center takes responsibility for implementing this Quality Policy, ensuring the effective operation of the quality management system, continuously improving processes, maintaining high standards of medical care, and building long-term trust among patients and partners.`;

/* ========== 2. ДОГОВІР ПУБЛІЧНОЇ ОФЕРТИ (з Додатком 1) ========== */

const publicContractRu = `ДОГОВОР ПУБЛИЧНОЙ ОФЕРТЫ
ОБ ОКАЗАНИИ УСЛУГ

ФЛП Харьковская Екатерина Сергеевна, действующая на основании лицензии на осуществление деятельности по медицинской практике, выданной на основании приказа Министерства здравоохранения Украины от 14.08.2025 № 1296 (далее Исполнитель/Центр долголетия и качества жизни) с одной стороны, в лице Директора — Харьковской Екатерины Сергеевны, действующей на основании Устава, руководствуясь ст. 633, 641 Гражданского кодекса Украины, предлагает неограниченному кругу физических лиц заключить Договор об оказании услуг (далее «Договор») на нижеизложенных условиях:

1.ТЕРМИНЫ

1.1. Услуги — перечень медицинских и иных сопутствующих услуг, предоставляемых Исполнителем в порядке и на условиях, определённых настоящим Договором и Правилами обслуживания, которые являются неотъемлемой частью настоящего Договора.

1.2. Акционные Предложения — дополнительные возможности к Услугам, предоставляемые Исполнителем для всех без исключения Пациентов, перечень и условия получения которых определены Правилами обслуживания. Предложениями, в частности, но не исключительно, являются: скидки, программы лояльности, специальные бонусные программы и т. п.

1.3. Публичная оферта — предложение Исполнителя (изложенное на Сайте Исполнителя), адресованное неограниченному кругу физических лиц заключить настоящий Договор на определённых условиях. Основной текст публичной оферты не подлежит редактированию иными способами, кроме Дополнительных соглашений и Приложений, датированных и размещённых на Сайте Исполнителя, с указанием даты их дополнения.

1.4. Сайт Исполнителя — веб-страница в сети Интернет по адресу https://genevity.com.ua/, которая является официальным источником информирования Пациентов об Исполнителе и предоставляемых им Услугах.

1.5. Заказчик/Пациент — физическое лицо, принявшее предложение Исполнителя о заключении Договора на условиях настоящего Договора.

1.6. Заказ — заявка на получение услуги от Заказчика, принятая Исполнителем посредством устного/письменного запроса или через электронный ресурс Исполнителя.

1.7. Акцепт — полное и безоговорочное согласие Заказчика на заключение настоящего Договора на условиях, определённых Исполнителем.

2.ОБЩИЕ ПОЛОЖЕНИЯ

2.1. Данное предложение является публичной офертой (далее «Оферта»).

2.2. Моментом акцепта настоящей Оферты и заключения Договора является момент оплаты Услуг или подписания акта выполненных работ/оказания услуг.

2.3. Заключая настоящий Договор, Заказчик подтверждает ознакомление и безоговорочное согласие с условиями всех правил и положений, размещённых на сайте Исполнителя.

2.4. Исполнитель оставляет за собой право вносить изменения в условия Оферты и/или отзывать Оферту в любой момент по своему усмотрению.

2.5. Если Исполнитель внёс изменения в Оферту, такие изменения вступают в силу с момента размещения новых условий Оферты на сайте Исполнителя.

3.ПОРЯДОК ОКАЗАНИЯ УСЛУГ

3.1. Исполнитель предоставляет Заказчику медицинские и сопутствующие услуги в соответствии с перечнем, установленным Исполнителем и размещённым на сайте.

3.2. Для получения услуг Заказчик обязан заполнить анкету пациента, предоставить необходимую информацию о состоянии здоровья и подписать информированное согласие на соответствующие медицинские процедуры.

3.3. Медицинские услуги оказываются исключительно лицами, имеющими соответствующее медицинское образование и квалификацию.

3.4. Исполнитель оставляет за собой право отказать в оказании услуг при наличии медицинских противопоказаний.

4.СТОИМОСТЬ УСЛУГ И ПОРЯДОК ОПЛАТЫ

4.1. Стоимость Услуг устанавливается Исполнителем и размещается на официальном сайте или в прейскуранте цен Центра долголетия и качества жизни.

4.2. Оплата за услуги осуществляется Заказчиком в полном объёме до или после получения услуги в соответствии с порядком, установленным Исполнителем.

4.3. Исполнитель оставляет за собой право изменять цены на услуги без предварительного согласия Заказчика.

4.4. В случае отмены записи менее чем за 24 часа до начала услуги Исполнитель оставляет за собой право удержать предоплату или применить штрафные санкции.

5.ПРАВА И ОБЯЗАННОСТИ СТОРОН

5.1. Исполнитель обязуется:
оказывать услуги в соответствии со стандартами качества и условиями настоящего Договора;
сохранять конфиденциальность медицинской информации Заказчика;
обеспечивать безопасность пациентов при оказании медицинских услуг;
своевременно информировать Заказчика об изменениях в условиях оказания услуг.

5.2. Исполнитель имеет право:
отказать в оказании услуг при нарушении Заказчиком условий настоящего Договора;
привлекать третьих лиц для оказания отдельных видов услуг;
переносить дату оказания услуг в случае возникновения обстоятельств непреодолимой силы.

5.3. Заказчик обязуется:
своевременно предоставлять достоверную информацию о состоянии своего здоровья;
соблюдать правила поведения в Центре долголетия и качества жизни;
своевременно оплачивать полученные услуги;
при наличии противопоказаний информировать медицинский персонал.

5.4. Заказчик имеет право:
получать полную и достоверную информацию об услугах;
отказаться от услуги до начала её оказания с возвратом оплаченной суммы (кроме случаев, предусмотренных законодательством);
получать медицинские документы и заключения, предусмотренные законодательством.

6.ОТВЕТСТВЕННОСТЬ СТОРОН

6.1. За неисполнение или ненадлежащее исполнение условий настоящего Договора Стороны несут ответственность в соответствии с действующим законодательством Украины.

6.2. Исполнитель не несёт ответственности за негативные последствия, возникшие вследствие предоставления Заказчиком недостоверной информации о состоянии здоровья или сокрытия имеющихся заболеваний.

6.3. Исполнитель не несёт ответственности за возникновение осложнений в случае нарушения Заказчиком рекомендаций врача в реабилитационный период.

6.4. Исполнитель не несёт ответственности за последствия обстоятельств непреодолимой силы.

7.КОНФИДЕНЦИАЛЬНОСТЬ

7.1. Исполнитель гарантирует неразглашение медицинских данных и персональной информации Заказчика, кроме случаев, предусмотренных законодательством Украины.

7.2. Заказчик даёт согласие на обработку своих персональных данных с целью оказания медицинских услуг, что является неотъемлемой частью договорных отношений между Сторонами.

8.ФОРС-МАЖОР

8.1. Стороны освобождаются от ответственности за неисполнение или ненадлежащее исполнение обязательств по настоящему Договору, если такое неисполнение является следствием обстоятельств непреодолимой силы (форс-мажор): военные действия, чрезвычайное положение, природные катастрофы, решения органов государственной власти и т. п.

8.2. Сторона, подвергшаяся действию форс-мажора, обязана уведомить другую сторону в течение 3 (трёх) дней.

9.ПОРЯДОК РАЗРЕШЕНИЯ СПОРОВ

9.1. Все споры, возникающие из настоящего Договора, разрешаются путём переговоров между Сторонами.

9.2. В случае невозможности разрешить спор путём переговоров спор подлежит рассмотрению в судебном порядке в соответствии с действующим законодательством Украины.

10.ПРОЧИЕ УСЛОВИЯ

10.1. Настоящий Договор вступает в силу с момента акцепта Оферты Заказчиком и действует до полного исполнения Сторонами своих обязательств.

10.2. В случае признания какого-либо положения настоящего Договора недействительным это не влияет на действительность остальных положений Договора.

10.3. Настоящий Договор составлен в соответствии с законодательством Украины.

11.РЕКВИЗИТЫ ИСПОЛНИТЕЛЯ

ФЛП Харьковская Екатерина Сергеевна

Юрид. адрес: 49116, Днепропетровская обл., Днепровский р-н, посёлок Слобожанское, ул. Волошковая, дом 18

Физический адрес: 49000, г. Днепр, ул. Гончара, д. 12

Идентификационный номер: 3887006966

Р/с №UA073052990000026003050624373 в АО КБ «ПриватБанк», МФО: 305299

Р/с №UA 123348510000000026009302974 в АО «ПУМБ», МФО: 14282829

тел.: +38(099)-111-91-91
эл. почта: kkharkivska@gmail.com

ПРИЛОЖЕНИЕ 1 К ДОГОВОРУ ПУБЛИЧНОЙ ОФЕРТЫ
ПРАВИЛА ОБСЛУЖИВАНИЯ

1.Общие положения

1.1. Настоящие Правила определяют порядок обслуживания ФЛП Харьковская Е.С. Центр долголетия и качества жизни "Genevity" (далее — Центр).

1.2. Обслуживание Пациента осуществляется на основании оригинала Анкеты, предоставленной Центром и подписанной непосредственно Пациентом.

1.3. Получение услуг должно осуществляться Пациентом в соответствии с настоящими Правилами.

2.Используемые термины и сокращения

2.1. Пациент Центра — физическое лицо, принявшее условия настоящих Правил и Договора публичной оферты.

2.2. Анкета — персональные данные Пациента, которая содержит согласие на обработку его персональных данных и добровольное согласие пациента на проведение диагностики, лечения, а также на проведение операции и обезболивания.

2.3. Информационное обслуживание — предоставление Центром Пациенту информации и документов в электронном виде.

3.Предоставляемая информация

3.1. Информационное обслуживание Пациента включает в себя информацию и документы о:
- истории посещений Пациентом Центра;
- записи Пациента на приём в Центр;
- перечне услуг, предоставляемых Центром;
- результатах медицинских и лабораторных исследований Пациента;
- специальных предложениях, предлагаемых Центром для Пациента.

4.Политика конфиденциальности и защиты персональных данных

4.1. Пациент подтверждает своё согласие на обработку Центром (местонахождение: 49000, Днепропетровская обл., г. Днепр, ул. Олеся Гончара, 12) персональных данных, включающих: полное имя, фамилию, отчество; фото; пол; номер медицинской карты; дату рождения; адрес электронной почты; номер мобильного/домашнего телефона; адрес места проживания и иную информацию.`;

const publicContractEn = `PUBLIC OFFER AGREEMENT
FOR THE PROVISION OF SERVICES

Individual Entrepreneur Kateryna Serhiivna Kharkivska, acting on the basis of a licence to carry out medical practice issued under Order of the Ministry of Health of Ukraine No. 1296 dated 14.08.2025 (hereinafter the Contractor / Center of Longevity and Quality of Life), on the one part, represented by the Director — Kateryna Serhiivna Kharkivska, acting on the basis of the Charter, guided by Articles 633 and 641 of the Civil Code of Ukraine, offers to an unlimited number of individuals to conclude an Agreement for the provision of services (hereinafter the "Agreement") on the terms set out below:

1.DEFINITIONS

1.1. Services — the list of medical and other related services provided by the Contractor in the manner and on the terms defined by this Agreement and the Service Rules, which form an integral part of this Agreement.

1.2. Promotional Offers — additional benefits to the Services provided by the Contractor to all Patients without exception, the list and conditions of which are defined by the Service Rules. Such offers include, in particular but not exclusively: discounts, loyalty programmes, special bonus programmes, etc.

1.3. Public offer — the Contractor's proposal (set out on the Contractor's Website), addressed to an unlimited number of individuals, to conclude this Agreement on specified terms. The main text of the public offer may not be edited by any means other than Supplementary Agreements and Appendices, dated and posted on the Contractor's Website with the date of their addition indicated.

1.4. Contractor's Website — the web page on the Internet at https://genevity.com.ua/, which is the official source of information for Patients about the Contractor and the Services it provides.

1.5. Customer/Patient — an individual who has accepted the Contractor's offer to conclude the Agreement on the terms of this Agreement.

1.6. Order — a request for a service from the Customer, accepted by the Contractor by oral/written request or through the Contractor's electronic resource.

1.7. Acceptance — the full and unconditional consent of the Customer to conclude this Agreement on the terms defined by the Contractor.

2.GENERAL PROVISIONS

2.1. This proposal is a public offer (hereinafter the "Offer").

2.2. The moment of acceptance of this Offer and conclusion of the Agreement is the moment of payment for the Services or signing of the act of work performed / services rendered.

2.3. By concluding this Agreement, the Customer confirms familiarity with, and unconditional consent to, the terms of all rules and provisions posted on the Contractor's website.

2.4. The Contractor reserves the right to amend the terms of the Offer and/or withdraw the Offer at any time at its discretion.

2.5. If the Contractor has amended the Offer, such amendments take effect from the moment the new terms of the Offer are posted on the Contractor's website.

3.PROCEDURE FOR PROVIDING SERVICES

3.1. The Contractor provides the Customer with medical and related services in accordance with the list established by the Contractor and posted on the website.

3.2. To receive services, the Customer must complete a patient questionnaire, provide the necessary information about their state of health, and sign informed consent for the relevant medical procedures.

3.3. Medical services are provided exclusively by persons with the appropriate medical education and qualifications.

3.4. The Contractor reserves the right to refuse to provide services in the presence of medical contraindications.

4.COST OF SERVICES AND PAYMENT PROCEDURE

4.1. The cost of the Services is set by the Contractor and posted on the official website or in the price list of the Center of Longevity and Quality of Life.

4.2. Payment for services is made by the Customer in full before or after receiving the service, in accordance with the procedure established by the Contractor.

4.3. The Contractor reserves the right to change the prices of services without the Customer's prior consent.

4.4. In the event of cancellation of an appointment less than 24 hours before the start of the service, the Contractor reserves the right to retain the prepayment or apply penalties.

5.RIGHTS AND OBLIGATIONS OF THE PARTIES

5.1. The Contractor undertakes to:
provide services in accordance with quality standards and the terms of this Agreement;
maintain the confidentiality of the Customer's medical information;
ensure patient safety during the provision of medical services;
promptly inform the Customer of changes in the terms of service provision.

5.2. The Contractor has the right to:
refuse to provide services if the Customer breaches the terms of this Agreement;
engage third parties to provide certain types of services;
postpone the date of service provision in the event of force majeure.

5.3. The Customer undertakes to:
promptly provide accurate information about their state of health;
comply with the rules of conduct at the Center of Longevity and Quality of Life;
pay for the services received in a timely manner;
inform medical staff of any contraindications.

5.4. The Customer has the right to:
receive complete and accurate information about the services;
refuse a service before it begins, with a refund of the amount paid (except in cases provided for by law);
receive medical documents and conclusions provided for by law.

6.LIABILITY OF THE PARTIES

6.1. For failure to perform or improper performance of the terms of this Agreement, the Parties shall be liable in accordance with the current legislation of Ukraine.

6.2. The Contractor shall not be liable for adverse consequences arising from the Customer providing inaccurate information about their state of health or concealing existing conditions.

6.3. The Contractor shall not be liable for the occurrence of complications if the Customer breaches the doctor's recommendations during the rehabilitation period.

6.4. The Contractor shall not be liable for the consequences of force majeure.

7.CONFIDENTIALITY

7.1. The Contractor guarantees non-disclosure of the Customer's medical data and personal information, except in cases provided for by the legislation of Ukraine.

7.2. The Customer consents to the processing of their personal data for the purpose of providing medical services, which is an integral part of the contractual relationship between the Parties.

8.FORCE MAJEURE

8.1. The Parties are released from liability for failure to perform or improper performance of obligations under this Agreement if such failure is a result of force majeure: military actions, a state of emergency, natural disasters, decisions of state authorities, etc.

8.2. The Party affected by force majeure must notify the other Party within 3 (three) days.

9.DISPUTE RESOLUTION PROCEDURE

9.1. All disputes arising from this Agreement shall be resolved through negotiations between the Parties.

9.2. If a dispute cannot be resolved through negotiations, it shall be subject to judicial review in accordance with the current legislation of Ukraine.

10.OTHER TERMS

10.1. This Agreement enters into force from the moment of acceptance of the Offer by the Customer and remains in effect until the Parties have fully performed their obligations.

10.2. If any provision of this Agreement is declared invalid, this shall not affect the validity of the other provisions of the Agreement.

10.3. This Agreement is drawn up in accordance with the legislation of Ukraine.

11.CONTRACTOR'S DETAILS

Individual Entrepreneur Kateryna Serhiivna Kharkivska

Registered address: 49116, Dnipropetrovsk region, Dnipro district, Slobozhanske settlement, 18 Voloshkova St.

Physical address: 49000, Dnipro, 12 Honchara St.

Identification number: 3887006966

Account No. UA073052990000026003050624373 at JSC CB "PrivatBank", MFO: 305299

Account No. UA 123348510000000026009302974 at JSC "PUMB", MFO: 14282829

tel.: +38(099)-111-91-91
e-mail: kkharkivska@gmail.com

APPENDIX 1 TO THE PUBLIC OFFER AGREEMENT
SERVICE RULES

1.General provisions

1.1. These Rules define the service procedure of Individual Entrepreneur K.S. Kharkivska, Center of Longevity and Quality of Life "Genevity" (hereinafter the Center).

1.2. The Patient is served on the basis of the original Questionnaire provided by the Center and signed directly by the Patient.

1.3. The Patient must receive services in accordance with these Rules.

2.Terms and abbreviations used

2.1. Patient of the Center — an individual who has accepted the terms of these Rules and the Public Offer Agreement.

2.2. Questionnaire — the Patient's personal data, which contains consent to the processing of their personal data and the patient's voluntary consent to diagnostics, treatment, and to surgery and anaesthesia.

2.3. Information service — the provision by the Center to the Patient of information and documents in electronic form.

3.Information provided

3.1. The Patient's information service includes information and documents on:
- the Patient's history of visits to the Center;
- the Patient's appointment booking at the Center;
- the list of services provided by the Center;
- the results of the Patient's medical and laboratory tests;
- special offers proposed by the Center for the Patient.

4.Privacy and personal data protection policy

4.1. The Patient confirms their consent to the processing by the Center (location: 49000, Dnipropetrovsk region, Dnipro, 12 Oles Honchar St.) of personal data including: full name, surname, patronymic; photo; gender; medical record number; date of birth; email address; mobile/home telephone number; place of residence and other information.`;

async function main() {
  console.log("📄 Filling RU + EN bodies for quality-policy and public-offer...\n");

  const qp = await sql`
    UPDATE legal_docs SET body_ru = ${qualityPolicyRu}, body_en = ${qualityPolicyEn}
    WHERE slug = 'quality-policy'
  `;
  console.log(`  ${qp.count ? "✓" : "⚠ NOT FOUND —"} quality-policy (${qp.count} row)`);

  const po = await sql`
    UPDATE legal_docs SET body_ru = ${publicContractRu}, body_en = ${publicContractEn}
    WHERE slug = 'public-offer'
  `;
  console.log(`  ${po.count ? "✓" : "⚠ NOT FOUND —"} public-offer (${po.count} row)`);

  await sql.end();
  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
