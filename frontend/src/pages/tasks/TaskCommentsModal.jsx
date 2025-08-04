import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../../services/api';
import { getToken } from '../../utils/token';
import toast from 'react-hot-toast';
import { Send, X, MessageSquare } from 'lucide-react';

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

function TaskCommentsModal({ isOpen, onClose, task }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // To identify the current user

  // Ref for the chat container to enable auto-scrolling
  const chatContainerRef = useRef(null);

  // Fetch current user's profile to distinguish their messages
  useEffect(() => {
    if (isOpen) {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get('/auth/profile', {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setCurrentUserId(res.data._id);
            } catch (error) {
                console.error("Could not fetch current user", error);
                toast.error("Could not verify user.");
            }
        };
        fetchCurrentUser();
    }
  }, [isOpen]);

  // Fetch all comments for the task
  const fetchComments = useCallback(async () => {
    if (!task?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/assign/tasks/${task._id}/comments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // ✅ FIXED: Sort comments by creation date (oldest first) for correct chat flow
      setComments(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (err) {
      console.error("Failed to fetch comments", err);
      toast.error("Could not load comments.");
    } finally {
      setLoading(false);
    }
  }, [task?._id]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  // Auto-scroll to the bottom when new comments are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") {
      toast.error("Comment cannot be empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `/assign/tasks/${task._id}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      // ✅ FIXED: Append the new comment to the end of the array
      setComments(prevComments => [...prevComments, res.data]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (err) {
      console.error("Failed to submit comment", err);
      toast.error("Could not add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[75vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <MessageSquare size={24} /> Comments: <span className='text-blue-600 truncate'>{task?.title}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {/* ✅ IMPROVED: Comments List with Chat-like UI */}
        <div ref={chatContainerRef} className="p-6 overflow-y-auto flex-grow space-y-6">
          {loading ? (
            <div className='flex justify-center items-center h-full'><Spinner /></div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 pt-10">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => {
                // Determine if the comment is from the current logged-in user
                const isCurrentUser = comment.user?._id === currentUserId;
                return (
                    <div key={comment._id} className={`flex items-end gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                       {/* Avatar for other users */}
                       {!isCurrentUser && (
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600 text-sm">
                                {comment.user?.name.charAt(0).toUpperCase()}
                           </div>
                       )}

                       {/* Message Bubble */}
                       <div className={`max-w-md md:max-w-lg ${isCurrentUser ? 'order-1' : ''}`}>
                            <div className='flex items-baseline gap-2'>
                                <p className={`text-sm font-semibold ${isCurrentUser ? 'text-right' : 'text-left'}`}>{isCurrentUser ? "You" : comment.user?.name}</p>
                            </div>
                           <div
                             className={`px-4 py-2 rounded-lg ${
                               isCurrentUser
                                 ? 'bg-blue-600 text-white rounded-br-none'
                                 : 'bg-gray-100 text-gray-800 rounded-bl-none'
                             }`}
                           >
                             <p>{comment.text}</p>
                           </div>
                           <p className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                             {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                       </div>
                    </div>
                )
            })
          )}
        </div>

        {/* Comment Input Form */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows="1"
              disabled={submitting || !currentUserId}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(e);
                  }
              }}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white w-10 h-10 rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center transition"
              disabled={submitting || newComment.trim() === "" || !currentUserId}
            >
              {submitting ? <Spinner /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskCommentsModal;