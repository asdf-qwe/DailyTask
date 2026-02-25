import React, { memo } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { RecentMemoRes } from "@/src/features/memo/types/memo";

interface RecentMemosProps {
  memos: RecentMemoRes[];
}

const RecentMemos = memo(function RecentMemos({ memos }: RecentMemosProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">최근 작성된 메모</h2>
        <Link
          href="/main/memo"
          className="text-sm text-gray-700 hover:text-gray-900"
        >
          전체보기
        </Link>
      </div>
      <div className="space-y-3">
        {memos.length > 0 ? (
          memos.map((memo) => (
            <Link
              key={memo.id}
              href={`/main/memo?id=${memo.id}`}
              className="block p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {memo.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {memo.authorName}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(memo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            작성된 메모가 없습니다
          </div>
        )}
      </div>
    </div>
  );
});

export default RecentMemos;
