import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useVerifyPayment } from "../hooks/useSubscription";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verify = useVerifyPayment();

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference || verify.status !== "idle") return;
    verify.mutate(reference);
  }, [reference, verify.status]);

  useEffect(() => {
    if (verify.isSuccess || verify.isError) {
      const timer = setTimeout(() => {
        navigate(verify.data?.success ? "/settings" : "/pricing", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verify.isSuccess, verify.isError, verify.data, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-cream p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-laurel-green/20">
        {verify.isPending && (
          <>
            <Loader2 size={40} className="animate-spin text-moderate-green mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-deep-bluish mb-2">
              Verifying Payment
            </h2>
            <p className="text-sm text-moderate-green/70">
              Please wait while we confirm your payment...
            </p>
          </>
        )}

        {verify.isSuccess && verify.data?.success && (
          <>
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-deep-bluish mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-moderate-green/70">
              Welcome to StudyMate Pro! Redirecting to settings...
            </p>
          </>
        )}

        {(verify.isError || (verify.isSuccess && !verify.data?.success)) && (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-deep-bluish mb-2">
              Payment Failed
            </h2>
            <p className="text-sm text-moderate-green/70">
              {verify.data?.message || "Something went wrong. Redirecting..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
