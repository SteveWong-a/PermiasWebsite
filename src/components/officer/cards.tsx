import React, { useState } from "react";
import { Officer } from "../../types";

interface OfficerCardsProps {
  member: Officer;
  className?: string;
  onClick?: () => void;
}

function getImageSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return process.env.PUBLIC_URL + url;
}

const OfficerCards: React.FC<OfficerCardsProps> = ({ member, className, onClick }) => {
  const [clickCount, setClickCount] = useState(0);
  const [imgError, setImgError] = useState(false);

  const handleCardClick = () => {
    if (member.name.toLowerCase() === "evan m. huang") {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount % 5 === 0) {
        window.open(
          "https://drive.google.com/file/d/1hopDUtOAdBjp5KGqPaxW4ECdMptj1M5O/view?usp=sharing"
        );
      }
    }
    onClick?.();
  };

  const hasImage = Boolean(member.image_url && !imgError);
  const initial = member.name.trim().charAt(0).toUpperCase();

  return (
    <div className={`relative w-full max-w-[340px] group ${className || ""}`}>
      <button
        onClick={handleCardClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-red rounded-3xl transition duration-300"
        aria-label={`View profile of ${member.name}, ${member.role}`}
      >
        <div className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform group-hover:-translate-y-1.5 border border-gray-100">
          {/* Picture or Avatar Container */}
          <div className="relative h-[420px] w-full overflow-hidden bg-slate-100">
            {hasImage ? (
              <img
                src={getImageSrc(member.image_url)}
                alt={member.name}
                onError={() => setImgError(true)}
                className="object-cover w-full h-full transform transition duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              /* Fallback Styled Avatar for Officers with pending headshots */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#13294b] via-[#1b3b6f] to-[#8c0305] text-white select-none">
                <div className="w-28 h-28 rounded-full border-4 border-white/30 flex items-center justify-center shadow-inner mb-4 bg-white/10 backdrop-blur-sm">
                  <span className="text-5xl font-black tracking-wider text-white">
                    {initial}
                  </span>
                </div>
                <div className="text-center px-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-white/20 backdrop-blur-sm rounded-full mb-2">
                    PERMIAS UIUC
                  </span>
                  <p className="text-xl font-bold tracking-tight text-white line-clamp-1">
                    {member.name}
                  </p>
                  <p className="text-xs text-red-200 mt-1 line-clamp-2 font-medium">
                    {member.role}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/60 font-semibold">
                  <span>Photo Coming Soon</span>
                </div>
              </div>
            )}

            {/* Subtle Gradient Overlay on Hover for photos */}
            {hasImage && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <span className="text-xs font-semibold text-white/90 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                  Click to view bio →
                </span>
              </div>
            )}
          </div>

          {/* Officer Details & Names */}
          <div className="p-5 text-center flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-2xl font-bold text-footer group-hover:text-red transition-colors duration-200">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-red mt-1">
                {member.role}
              </p>
            </div>

            {/* Quick Links / View Bio Pill */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs font-medium text-gray-500">
              <span className="hover:text-red transition">View Bio & Socials</span>
              {member.instagram && (
                <span className="text-red font-semibold">• Instagram</span>
              )}
              {member.linkedin && (
                <span className="text-blue-600 font-semibold">• LinkedIn</span>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default OfficerCards;
