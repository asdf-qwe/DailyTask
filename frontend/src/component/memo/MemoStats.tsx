import { memo } from "react";
import { MemoSummary } from "@/src/features/memo/types/memo";

interface MemoStatsProps {
  totalElements: number;
  memos: MemoSummary[];
  currentPage: number;
}

const MemoStats = memo(
  ({ totalElements, memos, currentPage }: MemoStatsProps) => {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">전체 메모</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalElements}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">공개 메모</div>
          <div className="text-2xl font-bold text-gray-900">
            {memos.filter((m) => m.sharedToTeam).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">비공개 메모</div>
          <div className="text-2xl font-bold text-gray-900">
            {memos.filter((m) => !m.sharedToTeam).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">현재 페이지</div>
          <div className="text-2xl font-bold text-gray-900">
            {currentPage + 1}
          </div>
        </div>
      </div>
    );
  }
);

MemoStats.displayName = "MemoStats";

export default MemoStats;
