const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(43_65%_52%_/_0.06)_0%,_transparent_70%)]" />

      {/* Islamic geometric pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.1] animate-float-pattern"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="islamic" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M40 0 L80 20 L80 60 L40 80 L0 60 L0 20 Z"
              fill="none"
              stroke="hsl(43, 86%, 56%)"
              strokeWidth="0.6"
            />
            <circle cx="40" cy="40" r="15" fill="none" stroke="hsl(43, 71%, 45%)" strokeWidth="0.3" />
            <path
              d="M40 25 L47 35 L40 45 L33 35 Z"
              fill="none"
              stroke="hsl(43, 81%, 57%)"
              strokeWidth="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic)" />
      </svg>
    </div>
  );
};

export default BackgroundPattern;
