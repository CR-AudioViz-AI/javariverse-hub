import { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://craudiovizai.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

