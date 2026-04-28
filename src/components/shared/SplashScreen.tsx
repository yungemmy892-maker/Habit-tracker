export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-emerald-950"
    >
      <div className="text-center">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-4xl font-bold text-emerald-300 tracking-tight">
          Habit Tracker
        </h1>
        <p className="mt-3 text-emerald-500 text-sm">Building better days</p>
      </div>
    </div>
  );
}
