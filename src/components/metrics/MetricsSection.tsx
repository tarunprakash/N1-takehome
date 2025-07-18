import { MessageFrequencyPie } from "@/components/metrics/MessageFrequencyPie";
import { AverageSizeBar } from "@/components/metrics/AverageSizeBar";
import KpiGrid from "@/components/metrics/KpiGrid";
import MessageRateChart from "@/components/metrics/MessageRateChart";

const COLORS = ['#DC2626', '#EA580C', '#2563EB', '#16A34A']; // red, orange, blue, green
const MESSAGE_TYPES = ['super heavy', 'heavy', 'regular', 'light'];

export default function MetricsSection() {
  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center">
      <div className="flex-1 h-px bg-gray-200 mr-8"></div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Legend:</span>
          <div className="flex items-center gap-3">
            {MESSAGE_TYPES.map((type, index) => (
              <div key={type} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-xs text-gray-700 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-4 w-full">
            <KpiGrid />
            <MessageRateChart />
            <div className="flex gap-4 flex-1">
                <MessageFrequencyPie />
                <AverageSizeBar />
            </div>
        </div>
      </div>
    </div>
  );
}
