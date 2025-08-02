import Spline from '@splinetool/react-spline';

export default function Robot3D() {
  return (
    <div className="w-[350px] h-[300px] absolute top-0 mx-auto">
      <Spline scene="scene.splinecode" />
    </div>
  );
}
