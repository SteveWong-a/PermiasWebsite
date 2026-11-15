import React, { useRef, useEffect, useState } from "react";
import { Officer } from "../../types";

interface PropOpen {
  isOpen: boolean;
  onClose: () => void;
  member: Officer;
}

function getImageSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return process.env.PUBLIC_URL + url;
}

const Popup: React.FC<PropOpen> = ({ isOpen, onClose, member }) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setImgError(false);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!visible) {
    return null;
  }

  const imageToUse = member.fun_image_url || member.image_url;
  const hasImage = Boolean(imageToUse && !imgError);
  const initial = member.name.trim().charAt(0).toUpperCase();

  const defaultBio =
    member.bio && member.bio.trim().length > 0
      ? member.bio
      : `Meet ${member.name}, serving as ${member.role} for PERMIAS UIUC. Dedicated to strengthening the Indonesian student community at the University of Illinois Urbana-Champaign and celebrating Indonesian culture.`;

  return (
    <div
      className={`fixed z-50 inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-y-auto transform transition-all duration-300 ease-out border border-gray-100 ${
          animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition shadow-sm"
          aria-label="Close dialog"
        >
          <span className="text-xl font-bold leading-none">&times;</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Photo / Visual Column */}
          <div className="md:col-span-5 bg-slate-100 relative min-h-[300px] md:min-h-full overflow-hidden">
            {hasImage ? (
              <img
                src={getImageSrc(imageToUse)}
                alt={member.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#13294b] via-[#1b3b6f] to-[#8c0305] text-white select-none">
                <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center shadow-lg mb-4 bg-white/10 backdrop-blur-sm">
                  <span className="text-6xl font-black text-white">{initial}</span>
                </div>
                <span className="text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full font-semibold">
                  PERMIAS UIUC
                </span>
                <p className="mt-3 text-2xl font-bold">{member.name}</p>
                <p className="text-sm text-red-200 text-center mt-1">{member.role}</p>
              </div>
            )}
          </div>

          {/* Bio & Details Column */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-red">
                  {member.team || "Officer Profile"}
                </span>
                <h2 className="text-3xl font-bold text-footer mt-1">{member.name}</h2>
                <p className="text-base font-semibold text-red mt-0.5">{member.role}</p>
              </div>

              {/* Bio Content */}
              <div className="text-gray-700 text-sm leading-relaxed space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {defaultBio.split("\n").map((line, index) =>
                  line.trim() ? (
                    <p key={index}>{line}</p>
                  ) : (
                    <div key={index} className="h-2" />
                  )
                )}
              </div>
            </div>

            {/* Social Links Footer */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Connect with {member.name}
              </span>
              <div className="flex items-center space-x-4">
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-gray-100 transition group"
                    title="Instagram"
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/officers/instagram.png"}
                      alt="Instagram"
                      className="w-8 h-8 object-contain transition transform group-hover:scale-110"
                    />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-gray-100 transition group"
                    title="LinkedIn"
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/officers/linkedin.png"}
                      alt="LinkedIn"
                      className="w-8 h-8 object-contain transition transform group-hover:scale-110"
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
