// Vercel-функция: читает фото документов водителя через Claude API и
// возвращает поля для доверенности в JSON.
//
// Переменные окружения (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY — ключ Claude API (console.anthropic.com)
//   APP_PASSWORD      — пароль, который вводят на странице; без него функция
//                       не тратит ключ на посторонних
import Anthropic from "@anthropic-ai/sdk";
import { timingSafeEqual } from "node:crypto";

const MAX_IMAGES = 6;
const MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PROMPT = `Ты считываешь казахстанские документы водителя грузовика для доверенности. На фото могут быть (в любом порядке, на одном или нескольких снимках):
- удостоверение личности РК (лицевая сторона: фамилия, имя, отчество, дата рождения, ЖСН/ИИН; оборот: номер документа 9 цифр вверху справа, орган выдачи, дата выдачи, машиночитаемая строка MRZ вида IDKAZ<9 цифр номера><контр.цифра><12 цифр ИИН><<<);
- или паспорт РК (номер 8 цифр, часто с буквой N впереди);
- техпаспорт тягача (свидетельство о регистрации ТС): поле 1 — госномер, поле 2 — марка и модель, поле 11 — владелец, поле 13 — мощность больше 0 kW, категория C/N3;
- техпаспорт прицепа: поле 1 — госномер, поле 2 — марка, мощность 0 kW, категория O/O4.

Правила:
- ФИО пиши кириллицей точно как в документе, включая казахские буквы (Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І).
- iin — 12 цифр; docNumber — как напечатан (9 цифр у удостоверения; у паспорта 8 цифр, букву N сохрани).
- Даты — ДД.ММ.ГГГГ.
- mrzDocNumber и mrzIin — только если MRZ на обороте читается; иначе null. Не переписывай их с лицевой стороны.
- brand тягача — только марка (DAF, VOLVO, MAN, SCANIA…), модель отдельно в model.
- plate — латиницей без пробелов (например 987ARP13). Номер тягача: 3 цифры + 3 буквы + 2 цифры; прицепа: 2 цифры + 3 буквы + 2 цифры.
- Если символ читается неоднозначно (O/0, B/8, 1/7 и т.п.) — впиши лучший вариант и добавь в uncertain короткую фразу по-русски: какое поле и какой символ под вопросом.
- Если какого-то документа нет на фото — добавь в missing по-русски (например "техпаспорт прицепа"), а его поля оставь пустыми или null.
- Ничего не выдумывай.`;

const str = { type: "string" };
const strOrNull = { anyOf: [{ type: "string" }, { type: "null" }] };
const vehicle = (fields) => ({
  anyOf: [
    {
      type: "object",
      properties: Object.fromEntries(fields.map((f) => [f, str])),
      required: fields,
      additionalProperties: false,
    },
    { type: "null" },
  ],
});

const SCHEMA = {
  type: "object",
  properties: {
    docType: { anyOf: [{ type: "string", enum: ["id_card", "passport"] }, { type: "null" }] },
    surname: str,
    name: str,
    patronymic: str,
    iin: str,
    docNumber: str,
    docIssueDate: str,
    birthDate: str,
    mrzDocNumber: strOrNull,
    mrzIin: strOrNull,
    truck: vehicle(["brand", "model", "plate", "owner"]),
    trailer: vehicle(["brand", "plate", "owner"]),
    uncertain: { type: "array", items: str },
    missing: { type: "array", items: str },
  },
  required: [
    "docType", "surname", "name", "patronymic", "iin", "docNumber", "docIssueDate",
    "birthDate", "mrzDocNumber", "mrzIin", "truck", "trailer", "uncertain", "missing",
  ],
  additionalProperties: false,
};

function passwordOk(given) {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(String(given || ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Только POST" });
  }
  if (!process.env.ANTHROPIC_API_KEY || !process.env.APP_PASSWORD) {
    return res.status(500).json({ error: "На сервере не заданы ANTHROPIC_API_KEY или APP_PASSWORD" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (!passwordOk(body.password)) {
    return res.status(401).json({ error: "Неверный пароль" });
  }

  const images = Array.isArray(body.images) ? body.images : [];
  if (!images.length) return res.status(400).json({ error: "Нет фото" });
  if (images.length > MAX_IMAGES) return res.status(400).json({ error: `Не больше ${MAX_IMAGES} фото за раз` });
  for (const img of images) {
    if (!MEDIA_TYPES.has(img?.media_type) || typeof img?.data !== "string" || !img.data) {
      return res.status(400).json({ error: "Фото должны быть JPEG, PNG или WebP" });
    }
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            ...images.map((img) => ({
              type: "image",
              source: { type: "base64", media_type: img.media_type, data: img.data },
            })),
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return res.status(422).json({ error: "Claude отказался обрабатывать эти фото. Впишите данные вручную." });
    }
    if (response.stop_reason === "max_tokens") {
      return res.status(502).json({ error: "Ответ оборвался. Попробуйте ещё раз." });
    }
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "Неверный ANTHROPIC_API_KEY на сервере" });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "Слишком много запросов. Подождите минуту." });
    }
    if (err instanceof Anthropic.BadRequestError) {
      return res.status(400).json({ error: "Claude API не принял запрос: " + err.message });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `Claude API недоступен (${err.status}). Попробуйте позже.` });
    }
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "Не удалось разобрать ответ. Попробуйте ещё раз." });
    }
    return res.status(500).json({ error: "Ошибка сервера: " + (err?.message || err) });
  }
}
