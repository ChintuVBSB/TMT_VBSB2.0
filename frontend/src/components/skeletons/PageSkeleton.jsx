// src/components/skeletons/CardSkeletonGrid.jsx
const PageSkelton = ({ count = 6 }) => {
  return (
    
    <div className="min-h-screen pt-28  bg-gray-50 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-4 space-y-4 animate-pulse"
          >
            <div className="h-4 bg-gray-300 rounded w-1/3" /> {/* small header */}
            <div className="h-6 bg-gray-300 rounded w-2/3" /> {/* title */}
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="pt-2">
              <div className="h-10 bg-gray-300 rounded-md w-1/2" /> {/* button */}
            </div>
          </div>
        ))}
      </div>
    </div>
   
  );
};

export default PageSkelton;
