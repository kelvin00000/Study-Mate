import { X, Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradePromptProps {
  message: string;
  onClose: () => void;
}

export function UpgradePrompt({ message, onClose }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-amber-50">
          <Crown size={24} className="text-amber-500" />
        </div>

        <h3 className="text-lg font-semibold text-deep-bluish mb-2">
          Upgrade to Pro
        </h3>
        <p className="text-sm text-moderate-green/70 mb-5">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-laurel-green/20 text-moderate-green/70 hover:border-moderate-green transition-colors"
          >
            Maybe later
          </button>
          <Link
            to="/pricing"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-opacity hover:opacity-90 bg-deep-bluish"
          >
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
