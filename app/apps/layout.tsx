import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://craudiovizai.com/apps",
  },
};

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

