import WsInputSection from "@/components/form/WsInputSection";
import WsFeedSection from "@/components/feed/WsFeedSection";
import MetricsSection from "@/components/metrics/MetricsSection";

export default function Home() {
  return (
    <>
    <div className="p-8 flex-col gap-8 w-full">
      <WsInputSection />
      <MetricsSection />
      <WsFeedSection />
    </div>
    </>
  );
}
