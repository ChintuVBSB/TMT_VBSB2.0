// src/components/skeletons/PageSkeleton.jsx
const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[80%] max-w-2xl space-y-4 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/2" />
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-2/3" />
        <div className="h-64 bg-gray-300 rounded" />
      </div>
    </div>
  );
};

export default PageSkeleton;
