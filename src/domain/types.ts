export type Role = "anon" | "patient" | "tutor" | "professional" | "admin";

export type View = "chat" | "history" | "info" | "expressions";

export interface Message {
  id: number;
  author: "user" | "avi";
  text: string;
}

export interface Thread {
  id: number;
  title: string;
  when: string;
}
