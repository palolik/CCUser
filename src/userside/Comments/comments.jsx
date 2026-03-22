import { useEffect, useState } from "react";
import { base_url } from '../../config/config.jsx';

const Avatar = ({ name, size = "md" }) => {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colors = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-cyan-500","bg-fuchsia-500"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
};

const TimeAgo = ({ date }) => {
  const d = new Date(date);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return <span>just now</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  if (diff < 86400) return <span>{Math.floor(diff / 3600)}h ago</span>;
  if (diff < 604800) return <span>{Math.floor(diff / 86400)}d ago</span>;
  return <span>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
};

const Comments = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [likedComments, setLikedComments] = useState(new Set());
  const [likedReplies, setLikedReplies] = useState(new Set());
  const [posting, setPosting] = useState(false);
  const [postingReply, setPostingReply] = useState(false);

  const fetchComments = async () => {
    const res = await fetch(`${base_url}/comments/${productId}`);
    const data = await res.json();
    setComments(data);
  };

  useEffect(() => {
    if (productId) fetchComments();
  }, [productId]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    await fetch(`${base_url}/addcomment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, userName: "Guest User", message: newComment }),
    });
    setNewComment("");
    setPosting(false);
    fetchComments();
  };

  const likeComment = async (commentId) => {
    await fetch(`${base_url}/likecomment/${commentId}`, { method: "PATCH" });
    setLikedComments(prev => new Set([...prev, commentId]));
    fetchComments();
  };

  const addReply = async (commentId) => {
    if (!replyText.trim()) return;
    setPostingReply(true);
    await fetch(`${base_url}/replycomment/${commentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: "Guest User", message: replyText }),
    });
    setReplyText("");
    setActiveReplyId(null);
    setPostingReply(false);
    fetchComments();
  };

  const likeReply = async (commentId, replyId) => {
    await fetch(`${base_url}/likereply/${commentId}/${replyId}`, { method: "PATCH" });
    setLikedReplies(prev => new Set([...prev, replyId]));
    fetchComments();
  };

  const handleKeyDown = (e, action) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) action();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-400">Discussion</p>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mt-0.5">
            Comments
            {comments.length > 0 && (
              <span className="ml-2 text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {comments.length}
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Compose Box */}
      <div className="mb-6 sm:mb-8">
        <div className="flex gap-3">
          <Avatar name="Guest User" />
          <div className="flex-1">
            <textarea
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all leading-relaxed min-h-[80px]"
              placeholder="Share your thoughts… (Ctrl+Enter to post)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addComment)}
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-slate-400">Ctrl+Enter to submit</p>
              <button
                onClick={addComment}
                disabled={!newComment.trim() || posting}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-all"
              >
                {posting ? (
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      {comments.length > 0 && <div className="h-px bg-slate-100 mb-5 sm:mb-6" />}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium">No comments yet</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {comments.map((comment) => (
            <div key={comment._id}>
              {/* Comment */}
              <div className="flex gap-3">
                <Avatar name={comment.userName} />
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">{comment.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        <TimeAgo date={comment.createdAt} />
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{comment.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <button
                      onClick={() => likeComment(comment._id)}
                      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                        likedComments.has(comment._id)
                          ? "text-blue-600"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill={likedComments.has(comment._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {comment.likes > 0 && <span>{comment.likes}</span>}
                      <span>Like</span>
                    </button>

                    <span className="text-slate-200">·</span>

                    <button
                      onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                      className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Reply Box */}
                  {activeReplyId === comment._id && (
                    <div className="mt-3 flex gap-2.5">
                      <Avatar name="Guest User" size="sm" />
                      <div className="flex-1">
                        <textarea
                          className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all leading-relaxed"
                          placeholder="Write a reply…"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, () => addReply(comment._id))}
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-1.5">
                          <button
                            onClick={() => addReply(comment._id)}
                            disabled={!replyText.trim() || postingReply}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            {postingReply ? "Posting…" : "Post Reply"}
                          </button>
                          <button
                            onClick={() => { setActiveReplyId(null); setReplyText(""); }}
                            className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies?.length > 0 && (
                    <div className="mt-3 space-y-3 border-l-2 border-slate-100 pl-3 sm:pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="flex gap-2.5">
                          <Avatar name={reply.userName} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="bg-slate-50 rounded-xl px-3 py-2.5">
                              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-semibold text-slate-800">{reply.userName}</span>
                                <span className="text-[10px] text-slate-400">
                                  <TimeAgo date={reply.createdAt} />
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{reply.message}</p>
                            </div>
                            <button
                              onClick={() => likeReply(comment._id, reply._id)}
                              className={`flex items-center gap-1 text-xs font-medium mt-1 px-1 transition-colors ${
                                likedReplies.has(reply._id)
                                  ? "text-blue-600"
                                  : "text-slate-400 hover:text-slate-700"
                              }`}
                            >
                              <svg className="w-3 h-3" fill={likedReplies.has(reply._id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              {reply.likes > 0 && <span>{reply.likes}</span>}
                              <span>Like</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;