import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X as XIcon, Crown, Menu, Loader2 } from "lucide-react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { CreateCourseModal } from "../components/dashboard/CreateCourseModal";
import { useSubscription, useInitiateUpgrade } from "../hooks/useSubscription";

type Interval = "monthly" | "yearly";
type Region = "GHS" | "INT";

const PRICES: Record<Region, Record<Interval, { amount: string; perMonth: string; freeLabel: string }>> = {
  GHS: {
    monthly: { amount: "GHS 15", perMonth: "GHS 15/mo", freeLabel: "GHS 0" },
    yearly: { amount: "GHS 100", perMonth: "~GHS 8.33/mo", freeLabel: "GHS 0" },
  },
  INT: {
    monthly: { amount: "$3", perMonth: "$3/mo", freeLabel: "$0" },
    yearly: { amount: "$15", perMonth: "~$1.25/mo", freeLabel: "$0" },
  },
};

const FEATURES = [
  { label: "Courses", free: "1", pro: "Unlimited" },
  { label: "Chat messages/day", free: "5", pro: "Unlimited" },
  { label: "Quick Chat", free: false, pro: true },
  { label: "AI Illustrations", free: false, pro: true },
  { label: "Quizzes/day", free: "1", pro: "Unlimited" },
  { label: "AI Model", free: "GPT-4o Mini", pro: "GPT-4o" },
  { label: "Streaks & Achievements", free: true, pro: true },
  { label: "Leaderboard", free: true, pro: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={16} className="text-green-500" />
    ) : (
      <XIcon size={16} className="text-gray-300" />
    );
  }
  return <span>{value}</span>;
}

const PricingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [interval, setInterval] = useState<Interval>("monthly");
  const [region, setRegion] = useState<Region>("INT");
  const [regionLoading, setRegionLoading] = useState(true);
  const { data: subscription } = useSubscription();
  const upgrade = useInitiateUpgrade();

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => {
        if (!res.ok) throw new Error("ipapi failed");
        return res.json();
      })
      .then((data) => {
        if (data.country_code === "GH") setRegion("GHS");
      })
      .catch(() =>
        fetch("https://ipwho.is/")
          .then((res) => res.json())
          .then((data) => {
            if (data.country_code === "GH") setRegion("GHS");
          })
          .catch(() => {})
      )
      .finally(() => setRegionLoading(false));
  }, []);

  const isPro = subscription?.plan === "pro";
  const price = PRICES[region][interval];

  const handleUpgrade = () => {
    upgrade.mutate({
      interval,
      region,
      callbackUrl: `${window.location.origin}/payment/callback`,
    });
  };

  return (
    <div className="flex h-screen font-normal bg-light-cream overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden lg:ml-60">
        <div className="lg:hidden flex items-center px-4 py-3 bg-light-cream">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/settings"
              className="inline-flex items-center gap-1.5 text-sm text-moderate-green/70 hover:text-deep-bluish mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Settings
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-semibold text-deep-bluish mb-2">
                Choose Your Plan
              </h1>
              <p className="text-sm text-moderate-green/70">
                Unlock unlimited learning with StudyMate Pro
              </p>
            </div>

            {/* Interval toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center bg-white rounded-xl border border-laurel-green/20 p-1">
                {(["monthly", "yearly"] as Interval[]).map((int) => (
                  <button
                    key={int}
                    onClick={() => setInterval(int)}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-all ${
                      interval === int
                        ? "bg-deep-bluish text-white"
                        : "text-moderate-green/70 hover:text-deep-bluish"
                    }`}
                  >
                    {int === "monthly" ? "Monthly" : "Yearly"}
                    {int === "yearly" && (
                      <span className="ml-1.5 text-xs opacity-80 hidden sm:inline">Save ~58%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plans */}
            {regionLoading ? (
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className={`bg-white rounded-2xl p-4 sm:p-6 animate-pulse ${
                      n === 2 ? "border-2 border-gray-200" : "border border-laurel-green/20"
                    }`}
                  >
                    <div className="mb-5">
                      <div className="h-5 w-16 rounded bg-gray-100 mb-2" />
                      <div className="h-3.5 w-40 rounded bg-gray-100 mb-3" />
                      <div className="h-8 w-24 rounded bg-gray-100" />
                    </div>
                    <div className="h-10 w-full rounded-xl bg-gray-100 mb-5" />
                    <div className="space-y-3">
                      {FEATURES.map(({ label }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="h-3.5 w-28 rounded bg-gray-100" />
                          <div className="h-3.5 w-16 rounded bg-gray-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              {/* Free Plan */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-laurel-green/20">
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-deep-bluish">Free</h3>
                  <p className="text-sm text-moderate-green/70 mt-1">
                    Get started with basic features
                  </p>
                  <p className="text-2xl font-bold text-deep-bluish mt-3">
                    {price.freeLabel}
                    <span className="text-sm font-normal text-moderate-green/70">/month</span>
                  </p>
                </div>

                {isPro ? (
                  <div className="py-2.5 text-center text-sm font-medium text-moderate-green/70 mb-5">
                    &mdash;
                  </div>
                ) : (
                  <div className="py-2.5 text-center text-sm font-semibold text-moderate-green border border-moderate-green rounded-xl mb-5">
                    Current Plan
                  </div>
                )}

                <ul className="space-y-3">
                  {FEATURES.map(({ label, free }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span className="text-moderate-green/70">{label}</span>
                      <span className="font-medium text-deep-bluish">
                        <FeatureValue value={free} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-deep-bluish relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-deep-bluish text-white text-xs font-semibold">
                  Recommended
                </div>

                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-deep-bluish">Pro</h3>
                    <Crown size={18} className="text-amber-500" />
                  </div>
                  <p className="text-sm text-moderate-green/70 mt-1">
                    Unlimited access to everything
                  </p>
                  <p className="text-2xl font-bold text-deep-bluish mt-3">
                    {price.amount}
                    <span className="text-sm font-normal text-moderate-green/70">
                      /{interval === "monthly" ? "month" : "year"}
                    </span>
                  </p>
                  {interval === "yearly" && (
                    <p className="text-xs text-moderate-green/70 mt-1">{price.perMonth}</p>
                  )}
                </div>

                {isPro && !subscription?.isTrial && subscription?.isOneTimePayment && subscription.renewalDueInDays !== null && subscription.renewalDueInDays <= 3 ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrade.isPending}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 bg-deep-bluish mb-5"
                  >
                    {upgrade.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Redirecting...
                      </span>
                    ) : (
                      "Renew Pro"
                    )}
                  </button>
                ) : isPro && !subscription?.isTrial ? (
                  <div className="py-2.5 text-center text-sm font-semibold text-white bg-moderate-green rounded-xl mb-5">
                    Current Plan
                  </div>
                ) : isPro && subscription?.isTrial ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrade.isPending}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 bg-deep-bluish mb-5"
                  >
                    {upgrade.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Redirecting...
                      </span>
                    ) : (
                      "Subscribe Now (Trial Active)"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrade.isPending}
                    className="w-full py-2.5 text-center text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 bg-deep-bluish mb-5"
                  >
                    {upgrade.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Redirecting...
                      </span>
                    ) : (
                      "Upgrade to Pro"
                    )}
                  </button>
                )}

                <ul className="space-y-3">
                  {FEATURES.map(({ label, pro }) => (
                    <li key={label} className="flex items-center justify-between text-sm">
                      <span className="text-moderate-green/70">{label}</span>
                      <span className="font-medium text-deep-bluish">
                        <FeatureValue value={pro} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            )}
          </div>
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default PricingPage;
