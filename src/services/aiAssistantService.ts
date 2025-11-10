export interface ChatRequestPayload {
  message: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatResponsePayload {
  reply: string;
  context?: Record<string, unknown>;
  rawResponse?: Record<string, unknown>;
  [key: string]: unknown;
}

const extractReplyFromResponse = (
  response: unknown
): { reply: string; context?: Record<string, unknown> } | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const maybeRecord = response as Record<string, unknown>;

  // Langsung gunakan jika sudah sesuai format { reply: string }
  const directReply = maybeRecord.reply;
  if (typeof directReply === "string" && directReply.trim().length > 0) {
    return {
      reply: directReply.trim(),
      context: maybeRecord.context as Record<string, unknown>,
    };
  }

  // Adaptasi format backend baru { success, message, data: { message } }
  const nestedData = maybeRecord.data;
  const nestedMessage =
    typeof nestedData === "object" && nestedData !== null
      ? (nestedData as Record<string, unknown>).message
      : undefined;

  if (typeof nestedMessage === "string" && nestedMessage.trim().length > 0) {
    const context: Record<string, unknown> = {
      success: maybeRecord.success,
      message: maybeRecord.message,
      data: nestedData,
    };

    return {
      reply: nestedMessage.trim(),
      context,
    };
  }

  // Cek fallback: respons utama terdapat pesan string
  if (typeof maybeRecord.message === "string") {
    return {
      reply: maybeRecord.message.trim(),
      context: maybeRecord.context as Record<string, unknown>,
    };
  }

  return null;
};

const resolveBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_AI_ASSISTANT_BASE_URL;

  if (typeof envUrl !== "string" || envUrl.trim().length === 0) {
    throw new Error(
      "Variabel lingkungan VITE_AI_ASSISTANT_BASE_URL belum dikonfigurasi."
    );
  }

  return envUrl.trim();
};

const resolveEndpointPath = (): string => {
  const envPath = import.meta.env.VITE_AI_ASSISTANT_PATH;

  if (typeof envPath !== "string" || envPath.trim().length === 0) {
    throw new Error(
      "Variabel lingkungan VITE_AI_ASSISTANT_PATH belum dikonfigurasi."
    );
  }

  return envPath.trim().startsWith("/")
    ? envPath.trim()
    : `/${envPath.trim()}`;
};

const buildEndpointUrl = () => {
  const baseUrl = resolveBaseUrl();
  const endpointPath = resolveEndpointPath();

  try {
    return new URL(endpointPath, baseUrl).toString();
  } catch (error) {
    console.error("Gagal membentuk URL AI Assistant:", error);
    throw new Error("URL AI Assistant tidak valid. Periksa konfigurasi .env.");
  }
};

export async function sendChatMessage(
  payload: ChatRequestPayload
): Promise<ChatResponsePayload> {
  const endpointUrl = buildEndpointUrl();

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Gagal menghubungi AI Assistant.";

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === "string" && errorBody.error.trim()) {
        errorMessage = errorBody.error;
      } else if (
        typeof errorBody?.message === "string" &&
        errorBody.message.trim()
      ) {
        errorMessage = errorBody.message;
      }
    } catch {
      // Abaikan kegagalan parsing error body.
    }

    throw new Error(errorMessage);
  }

  const raw = (await response.json()) as Record<string, unknown>;
  const extracted = extractReplyFromResponse(raw);

  if (!extracted) {
    throw new Error("Respons AI Assistant tidak valid.");
  }

  return {
    ...extracted,
    rawResponse: raw,
  };
}
