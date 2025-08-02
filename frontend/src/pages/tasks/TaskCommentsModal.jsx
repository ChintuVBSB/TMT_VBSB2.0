// components/TaskCommentsModal.js

import { useState, useEffect } from 'react';
import axios from '../../services/api';
import toast from 'react-hot-toast';
import { getToken } from '../../utils/token';

const TaskCommentsModal = ({ isOpen, onClose, task }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to fetch comments
  const fetchComments = async () => {
    if (!task) return;
    try {
      const res = await axios.get(`/assign/tasks/${task._id}/comments`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setComments(res.data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
      toast.error('Could not load comments.');
    }
  };

  // Fetch comments when the modal opens or the task changes
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `/assign/tasks/${task._id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      // Add the new comment to the list instantly for a great UX
      setComments([...comments, res.data]); 
      setNewComment(''); // Clear the input field
      
    } catch (error) {
      toast.error('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Discussion for: {task.title}</h2>
        
        {/* Comments Display Area */}
        <div className="h-64 overflow-y-auto mb-4 border p-3 rounded-md bg-gray-50">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="mb-3">
                <p className="font-semibold text-sm">
                  {comment.user.name} <span className="text-xs text-gray-500 font-normal">({comment.user.role})</span>
                </p>
                <p className="bg-blue-100 text-gray-800 p-2 rounded-md inline-block">{comment.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10">No comments yet. Start the conversation!</p>
          )}
        </div>

        {/* New Comment Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Write a comment..."
            rows="3"
            disabled={loading}
          ></textarea>
          <div className="flex justify-end mt-4">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md text-gray-600">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-950 text-white hover:bg-blue-900" disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCommentsModal;