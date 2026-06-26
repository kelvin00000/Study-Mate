import { ServerCrash, RefreshCw, ArrowLeft } from "lucide-react";

interface ServerErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function ServerErrorScreen({
  title = "Something went wrong",
  message = "We're having trouble connecting to the server. This is usually temporary — please try again.",
  onRetry,
  onGoHome,
}: ServerErrorScreenProps) {
  return (
    <div className="min-h-screen bg-light-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <ServerCrash size={28} className="text-red-400" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-deep-bluish mb-2">
          {title}
        </h1>
        <p className="text-sm text-moderate-green/70 leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-deep-bluish transition-opacity hover:opacity-90"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-laurel-green/20 text-deep-bluish transition-colors hover:bg-white"
            >
              <ArrowLeft size={15} />
              Go Home
            </button>
          )}
        </div>

        <p className="text-xs text-laurel-green mt-8 opacity-60">
          If this keeps happening, check your connection or try again later.
        </p>
      </div>
    </div>
  );
}
