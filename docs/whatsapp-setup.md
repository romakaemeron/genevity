# WhatsApp confirmation for online bookings — setup

The code is finished and deployed on `develop`. It sends nothing until the four
environment variables below exist, so it is safe to ship in this state: with no
credentials every booking simply records `whatsapp_status = 'skipped'`.

Everything on this page is work that has to happen inside Meta's systems, which
is why it can't be automated from the repo.

---

## What the patient receives

Only if they tick **"Надіслати підтвердження у WhatsApp"** in the booking
wizard. The box is unticked by default, and the answer is stored on the
submission — WhatsApp's policy requires explicit opt-in, and consent you can't
produce later isn't consent.

```
Вітаємо, Олено! Ваш запис до GENEVITY підтверджено.

🗓 *11 вересня 2026, 14:00*
👨‍⚕️ Кириленко Анжела В'ячеславівна
💠 Ботулінотерапія
📍 м. Дніпро, вул. Олеся Гончара, 12

Будь ласка, приходьте за 10 хвилин до початку.
Якщо плани зміняться — зателефонуйте нам заздалегідь.

[ Зателефонувати ]
```

The clinic's own Telegram alert gains a line saying what happened to it:
`✅ підтвердження надіслано`, `⚠️ немає WhatsApp — підтвердьте дзвінком`,
`⚠️ не вдалося надіслати — підтвердьте дзвінком`, or
`— пацієнт не давав згоди`. The same outcome shows on the submission in
/admin/forms.

---

## Step 1 — A phone number you can dedicate to this

**This is the step that most often has to be redone, so settle it first.**

The number must **not** be registered on regular WhatsApp or on the WhatsApp
Business *app*. If the clinic's current number is in use on someone's phone, you
cannot use it here without deleting that account first — and deleting it erases
that chat history permanently.

The safe options:

- a new SIM used only for this, or
- a landline that can receive the verification call, or
- delete the existing WhatsApp account on the current number first, accepting
  the loss of its history.

The number the patient *sees* is this one, so it should be a number the clinic
is happy to be called back on. It's separate from the `Зателефонувати` button,
which you set in step 4.

## Step 2 — Meta Business account and verification

1. Go to <https://business.facebook.com> and open (or create) the GENEVITY
   business portfolio.
2. **Business settings → Business info → Start verification.**
3. Submit the clinic's registration documents. Meta checks the legal name,
   address and phone against public records, so the documents must match the
   business details exactly.

Verification typically takes 1–3 business days. Nothing below can go live
without it.

## Step 3 — Create the WhatsApp app

1. <https://developers.facebook.com/apps> → **Create app** → type **Business**.
2. Add the **WhatsApp** product.
3. Connect the business portfolio from step 2.
4. **API Setup → Add phone number** → register the number from step 1 and
   complete the SMS/voice verification.
5. Set the **display name** (use `GENEVITY`). Meta reviews it — it must
   plausibly be the business's name, not a slogan.

From this screen, copy two values:

- **Phone number ID** — a long number under the phone number (this is *not* the
  phone number itself).
- **Access token** — the temporary one lasts 24 hours and is fine for a first
  test, but for production create a permanent one:
  **Business settings → Users → System users → Add** → assign the app with
  `whatsapp_business_messaging` and `whatsapp_business_management` permissions
  → **Generate token** with no expiry.

## Step 4 — Submit the message template

**WhatsApp → Message templates → Create template.**

| Field | Value |
|---|---|
| Name | `booking_confirmation` |
| Category | **Utility** (not Marketing — Marketing is likelier to be rejected and costs more) |
| Language | Ukrainian, then repeat for Russian and English |

**Body** — paste exactly, keeping the `{{1}}`…`{{5}}` placeholders:

```
Вітаємо, {{1}}! Ваш запис до GENEVITY підтверджено.

🗓 *{{2}}*
👨‍⚕️ {{3}}
💠 {{4}}
📍 {{5}}

Будь ласка, приходьте за 10 хвилин до початку. Якщо плани зміняться — зателефонуйте нам заздалегідь.
```

**Sample values** (Meta requires them, and rejects templates without):

| Placeholder | Sample | Comes from |
|---|---|---|
| `{{1}}` | Олена | patient's name |
| `{{2}}` | 11 вересня 2026, 14:00 | visit time, Kyiv |
| `{{3}}` | Кириленко Анжела В'ячеславівна | doctor, from RoApp |
| `{{4}}` | Ботулінотерапія | service |
| `{{5}}` | м. Дніпро, вул. Олеся Гончара, 12 | clinic address, from the CMS |

**Buttons** → **Call phone number** → text `Зателефонувати`, number
`+380 73 000 0150`.

**Footer** (optional): `GENEVITY · Центр медицини довголіття`

Then repeat for **Russian** and **English** under the same template name — the
site sends whichever language the visitor booked in, falling back to Ukrainian.

<details>
<summary>Russian and English bodies</summary>

```
Здравствуйте, {{1}}! Ваша запись в GENEVITY подтверждена.

🗓 *{{2}}*
👨‍⚕️ {{3}}
💠 {{4}}
📍 {{5}}

Пожалуйста, приходите за 10 минут до начала. Если планы изменятся — позвоните нам заранее.
```

```
Hello {{1}}, your appointment at GENEVITY is confirmed.

🗓 *{{2}}*
👨‍⚕️ {{3}}
💠 {{4}}
📍 {{5}}

Please arrive 10 minutes early. If your plans change, give us a call in advance.
```
</details>

Approval usually lands within a few hours. If it's rejected, the reason is
almost always the category (use Utility) or a placeholder sitting at the very
start or end of the body — the text above is already arranged to avoid that.

## Step 5 — Give me the credentials

Send me these four, or add them yourself in Vercel under
**Preview (develop)** and **Development**, mirroring how `ROAPP_*` and
`TELEGRAM_*` are scoped:

```
WHATSAPP_ACCESS_TOKEN=          # permanent system-user token from step 3
WHATSAPP_PHONE_NUMBER_ID=       # the numeric id from API Setup, not the phone number
WHATSAPP_TEMPLATE_NAME=booking_confirmation
WHATSAPP_API_VERSION=v26.0      # optional; only to move off the pinned version
```

Production is deliberately excluded for now — the booking wizard stays on
`develop` until the client signs it off.

## Step 6 — Test

Make a booking on the develop preview with the WhatsApp box ticked, using a
number that has WhatsApp. Expect the template message within seconds, and a
`✅ підтвердження надіслано` line in the clinic's Telegram group. Then delete
the test appointment from RoApp.

While the app is in **development mode**, Meta only delivers to numbers you've
added under **API Setup → recipient phone numbers**. Add your own number there
before testing, or the send will come back as unreachable.

---

## Cost

Meta bills per *conversation*, not per message, under the **Utility** rate for
Ukraine — cents per confirmation, charged only when a message is actually
delivered. There is a monthly allowance of free service conversations. Set a
spending limit in **Business settings → Billing** if you want a hard ceiling.

## What happens when it doesn't work

By design, nothing breaks. The booking is written into RoApp *before* any of
this runs, so a failed or unconfigured WhatsApp send can never cost an
appointment — it only changes the line in the Telegram alert, which tells the
front desk to confirm by phone instead.
