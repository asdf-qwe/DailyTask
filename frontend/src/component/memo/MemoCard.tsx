import { memo } from "react";
import { MoreVertical, Users, Lock } from "lucide-react";
import { MemoSummary } from "@/src/features/memo/types/memo";

interface MemoCardProps {
  memo: MemoSummary;
  onClick: (memo: MemoSummary) => void;
}

const MemoCard = memo(({ memo, onClick }: MemoCardProps) => {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(memo)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg flex-1">
            {memo.title}
          </h3>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">{memo.authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            {memo.sharedToTeam ? (
              <Users className="w-3 h-3" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            <span>{new Date(memo.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

MemoCard.displayName = "MemoCard";

export default MemoCard;
