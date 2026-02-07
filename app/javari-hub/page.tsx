/**
 * JAVARI HUB
 * Route: /javari-hub
 * Multi-AI Chamber embedded in main site
 */

import JavariChamberUI from "@/app/components/JavariChamberUI";

export const metadata = {
  title: "Javari Hub | CR AudioViz AI",
  description: "Multi-AI collaboration workspace - ChatGPT + Claude + Javari",
};

export default function JavariHubPage() {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <JavariChamberUI />
    </div>
  );
}
