import localFont from "next/font/local";

export const handicrafts = localFont({
  src: [
    {
      path: "../public/fonts/TheYearofHandicrafts-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/TheYearofHandicrafts-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/TheYearofHandicrafts-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/TheYearofHandicrafts-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/TheYearofHandicrafts-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-handicrafts",
  display: "swap",
});
