export type StatusTone = "sage" | "ochre" | "terracotta";

export const STATUS_COPY: Record<
  string,
  { tone: StatusTone; title: string; body: string }
> = {
  active: {
    tone: "sage",
    title: "Your profile is live",
    body: "Parents in Benin City can find and book you right now.",
  },
  pending: {
    tone: "ochre",
    title: "Verification in progress",
    body: "Our team is reviewing your documents and profile details.",
  },
  pending_verification: {
    tone: "ochre",
    title: "Verification in progress",
    body: "Our team is reviewing your documents and profile details.",
  },
  rejected: {
    tone: "terracotta",
    title: "Action needed on your profile",
    body: "Something needs your attention before we can verify you.",
  },
};