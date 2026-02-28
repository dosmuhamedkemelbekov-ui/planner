import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { goal } = (await req.json()) as { goal?: string };
  if (!goal || typeof goal !== "string") {
    return NextResponse.json({ error: "Нужен текст цели" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY не задан в .env" },
      { status: 500 }
    );
  }

  const system = `Ты помощник по планированию. Пользователь даёт цель. Ответь ТОЛЬКО списком конкретных задач (каждая с новой строки), без нумерации и без лишнего текста. Задачи должны быть небольшими и выполнимыми. Формат: одна задача = одна строка.`;

  try {
    const res = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          system,
          messages: [{ role: "user", content: `Цель: ${goal}\n\nДай список задач.` }],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Claude API: ${res.status} ${err}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      data.content?.find((c) => c.type === "text")?.text?.trim() ?? "";
    const tasks = text
      .split("\n")
      .map((s) => s.replace(/^[\d.)\-\s]+/, "").trim())
      .filter(Boolean);

    return NextResponse.json({ tasks });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка запроса к Claude" },
      { status: 500 }
    );
  }
}
