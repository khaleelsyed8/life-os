export default function Card({ children, className = "", hover = false }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-2xl hover:scale-[1.02]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}