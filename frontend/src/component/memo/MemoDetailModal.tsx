import { memo } from "react";
import { X, Edit, Trash2, Users, Lock } from "lucide-react";
import { MemoRes } from "@/src/features/memo/types/memo";

interface MemoDetailModalProps {
  show: boolean;
  memo: MemoRes | null;
  onClose: () => void;
  onEdit: (memo: MemoRes) => void;
  onDelete: (id: number) => void;
}

const MemoDetailModal = memo(
  ({ show, memo, onClose, onEdit, onDelete }: MemoDetailModalProps) => {
    if (!show || !memo) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {memo.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{memo.author.name}</span>
                <span>•</span>
                <span>{new Date(memo.createdAt).toLocaleString()}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {memo.sharedToTeam ? (
                    <>
                      <Users className="w-4 h-4" />
                      <span>공개</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>비공개</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(memo)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => onDelete(memo.id)}
                className="p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {memo.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MemoDetailModal.displayName = "MemoDetailModal";

export default MemoDetailModal;
