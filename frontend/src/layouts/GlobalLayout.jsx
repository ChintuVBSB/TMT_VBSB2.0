// src/layouts/GlobalLayout.jsx
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import PageSkeleton from "../components/skeletons/PageSkeleton";

const GlobalLayout = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate loading delay
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // change as needed

    return () => clearTimeout(timeout);
  }, []);

  return loading ? <PageSkeleton /> : <Outlet />;
};

export default GlobalLayout;
