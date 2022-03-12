import ym from "react-yandex-metrika";

export const AndrewLytics = (goal: string) => {
  const isProd = process.env.NODE_ENV === "production";
  isProd ? ym("reachGoal", goal) : console.log("AndrewLytics >", goal);
};
