"use client";

import Loader from "@/components/atoms/Loader/Loader";
import CommentThreadItem from "@/components/molecules/CommentThreadItem";
import type { EventCommentItem } from "@/features/events/event-comments-api";

type CommentThreadProps = {
  comments: EventCommentItem[];
  isLoading?: boolean;
  updatingCommentId?: string | null;
  deletingCommentId?: string | null;
  onUpdateComment?: (commentId: string, body: string) => Promise<void>;
  onDeleteCommentRequest?: (comment: EventCommentItem) => void;
};

export default function CommentThread({
  comments,
  isLoading = false,
  updatingCommentId = null,
  deletingCommentId = null,
  onUpdateComment,
  onDeleteCommentRequest,
}: CommentThreadProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-earth-300 bg-earth-100 px-4 py-8 text-center text-sm text-earth-500">
        Todavía no hay comentarios. Sé el primero en comentar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentThreadItem
          key={comment.id}
          comment={comment}
          isUpdating={updatingCommentId === comment.id}
          isDeleting={deletingCommentId === comment.id}
          onUpdate={onUpdateComment}
          onDeleteRequest={onDeleteCommentRequest}
        />
      ))}
    </div>
  );
}
