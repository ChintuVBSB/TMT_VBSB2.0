// src/components/Droid.jsx
import Spline from '@splinetool/react-spline';

export default function Droid() {
  return (
   <div className="w-full absolute -left-8 bottom-0 max-w-[320px] h-[250px] mx-auto">
  <Spline scene="/scene.droid.splinecode" />
</div>

  );
}
