const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200/50 p-12">
      <div className="max-w-md text-center">
        {/* Grid Pattern */}
        <div className="grid grid-cols-3 gap-4 mb-8 mx-auto w-fit">
          {[...Array(9)].map((_, i) => {
            const delay = (i % 3) * 0.2 + Math.floor(i / 3) * 0.1;
            const isCenter = i === 4;
            const isCorner = [0, 2, 6, 8].includes(i);
            
            return (
              <div
                key={i}
                className={`w-20 h-20 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 ${
                  isCenter 
                    ? 'bg-gradient-to-br from-blue-700/90 to-blue-900/70 animate-pulse'
                    : isCorner 
                    ? 'bg-gradient-to-br from-blue-800/70 to-blue-900/50 animate-pulse'
                    : 'bg-gradient-to-br from-blue-800/80 to-blue-900/60 animate-pulse'
                }`}
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: `${2.5 + (i % 3) * 0.5}s`
                }}
              />
            );
          })}
        </div>
        
        {/* Text */}
        <h2 className="text-2xl font-bold mb-4 text-base-content">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;

