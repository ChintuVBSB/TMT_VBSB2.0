import React from "react";

const Checkbox = ({ checked, onChange }) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-blue-500"
      disabled={checked}
    />
  );
};

export default Checkbox;
