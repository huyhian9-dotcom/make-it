import type { RoutineBlock } from '@makeit/shared';
import { AlignJustify } from 'lucide-react';

interface RoutineTimelineProps {
  blocks: RoutineBlock[];
}

export function RoutineTimeline({ blocks }: RoutineTimelineProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm text-gray-500 font-medium">Meu dia</span>
        <button className="text-gray-400">
          <AlignJustify size={18} />
        </button>
      </div>

      {/* Blocks */}
      {blocks.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">Nenhum bloco de rotina ainda.</div>
      ) : (
        <div>
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-stretch"
              style={{ backgroundColor: `${block.color}22` }}
            >
              {/* Time column */}
              <div
                className="w-16 flex-shrink-0 flex flex-col items-center justify-center py-4 text-xs font-semibold"
                style={{ color: block.color }}
              >
                <span>{block.startTime}</span>
                {block.endTime && (
                  <>
                    <span className="text-gray-400 my-0.5">—</span>
                    <span>{block.endTime}</span>
                  </>
                )}
              </div>

              {/* Content column */}
              <div
                className="flex-1 flex items-center py-4 px-3 border-l"
                style={{ borderColor: `${block.color}44` }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: block.color }}
                >
                  {block.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
