import { ServerCrash, RefreshCw, ArrowLeft } from "lucide-react";

interface QueryErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  backLabel?: string;
  backTo?: string;
}

export function QueryErrorState({
  title = "Failed to load",
  message = "We couldn't load this page. The server might be temporarily unavailable.",
  onRetry,
  backLabel = "Go back",
  backTo,
}: QueryErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="mb-5 w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <ServerCrash size={24} className="text-red-400" />
      </div>
      <p className="text-base font-semibold mb-1.5 text-deep-bluish">{title}</p>
      <p className="text-sm text-moderate-green/70 max-w-xs mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-2.5">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-deep-bluish transition-opacity hover:opacity-90"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
        {backTo && (
          <a
            href={backTo}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-laurel-green/20 text-deep-bluish transition-colors hover:bg-white"
          >
            <ArrowLeft size={14} />
            {backLabel}
          </a>
        )}
      </div>
    </div>
  );
}
