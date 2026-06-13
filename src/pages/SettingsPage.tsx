import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Menu } from 'lucide-react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { CreateCourseModal } from '../components/dashboard/CreateCourseModal';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useSubmitPreference } from '../hooks/useSubmitPreference';
import { onboardingSteps } from '../constants/Onboardingdata';

const DEFAULT_INTERESTS = [
  "Football", "Basketball", "Baseball", "Tennis", "Swimming",
  "Music", "Dance", "Gaming", "Anime", "Formula 1", "Movies & TV",
  "Fashion", "Cooking", "Photography", "Travel", "Fitness",
  "Reading", "Art & Design", "Technology", "Nature & Hiking", "Cars",
];

const PREF_STEPS = [
  {
    stepIdx: 0,
    getTitle: (prefs: { educationLevel: number }) =>
      onboardingSteps[0].options[(prefs.educationLevel ?? 1) - 1]?.title ?? '',
  },
  {
    stepIdx: 1,
    getTitle: (prefs: { explanationDepth: number }) =>
      onboardingSteps[1].options[(prefs.explanationDepth ?? 1) - 1]?.title ?? '',
  },
  {
    stepIdx: 2,
    getTitle: (prefs: { learningGoal: string }) => prefs.learningGoal ?? '',
  },
  {
    stepIdx: 3,
    getTitle: (prefs: { studySessionDuration: number }) =>
      onboardingSteps[3].options[(prefs.studySessionDuration ?? 1) - 1]?.title ?? '',
  },
];

const SettingsPage = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: prefs, isLoading } = useUserPreferences();
  const { mutate: submitPreference, isPending } = useSubmitPreference();

  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState<string[]>(DEFAULT_INTERESTS);
  const [newInterest, setNewInterest] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!prefs) return;
    const init: Record<number, string> = {};
    PREF_STEPS.forEach(({ stepIdx, getTitle }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      init[stepIdx] = getTitle(prefs as any);
    });
    setSelections(init);
    setInterests(prefs.interests ?? []);
    setAllInterests(prev => {
      const extra = (prefs.interests ?? []).filter(i => !prev.includes(i));
      return extra.length ? [...prev, ...extra] : prev;
    });
  }, [prefs]);

  const handleSave = () => {
    const selArr = PREF_STEPS.map(({ stepIdx }) => ({
      title: onboardingSteps[stepIdx].finalQuestion,
      selection: selections[stepIdx] ?? '',
    }));
    submitPreference({ selections: selArr, interests }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };

  const addCustomInterest = () => {
    const trimmed = newInterest.trim();
    if (!trimmed || allInterests.includes(trimmed)) return;
    setAllInterests(prev => [...prev, trimmed]);
    setInterests(prev => [...prev, trimmed]);
    setNewInterest('');
  };

  return (
    <div className="flex h-screen font-normal bg-light-cream overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewCourse={() => setModalOpen(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden lg:ml-60">
        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center px-4 py-3 bg-light-cream">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-1 text-deep-bluish">
              Settings
            </h1>
            <p className="text-sm mb-8 text-moderate-green/70">
              Manage your profile and learning preferences.
            </p>

            {/* Profile */}
            <section className="bg-white rounded-2xl p-6 mb-6 border border-laurel-green/20">
              <h2 className="text-base font-semibold mb-4 text-deep-bluish">
                Profile
              </h2>
              <div className="flex items-center gap-4">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName ?? 'Avatar'}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-deep-bluish">
                    {user?.fullName}
                  </p>
                  <p className="text-sm mt-0.5 text-moderate-green/70">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
            </section>

            {/* Learning Preferences */}
            <section className="bg-white rounded-2xl p-6 mb-6 border border-laurel-green/20">
              <h2 className="text-base font-semibold mb-5 text-deep-bluish">
                Learning Preferences
              </h2>

              {isLoading ? (
                <div className="space-y-5">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="animate-pulse">
                      <div className="h-3.5 w-36 rounded bg-gray-100 mb-3" />
                      <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3].map(m => (
                          <div key={m} className="h-9 w-24 rounded-xl bg-gray-100" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {PREF_STEPS.map(({ stepIdx }) => {
                    const step = onboardingSteps[stepIdx];
                    return (
                      <div key={stepIdx}>
                        <p className="text-sm font-medium mb-2.5 text-moderate-green/70">
                          {step.highlight.replace('?', '')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.options.map(opt => {
                            const active = selections[stepIdx] === opt.title;
                            return (
                              <button
                                key={opt.title}
                                onClick={() =>
                                  setSelections(prev => ({ ...prev, [stepIdx]: opt.title }))
                                }
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                  active
                                    ? 'text-white border-transparent bg-moderate-green'
                                    : 'text-moderate-green/70 border-laurel-green/20 hover:border-moderate-green hover:text-moderate-green'
                                }`}
                              >
                                {opt.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Interests */}
            <section className="bg-white rounded-2xl p-6 mb-8 border border-laurel-green/20">
              <h2 className="text-base font-semibold mb-1 text-deep-bluish">
                Interests
              </h2>
              <p className="text-sm mb-4 text-moderate-green/70">
                Select topics you're passionate about.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add custom interest..."
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomInterest(); }}
                  className="flex-1 border border-laurel-green/20 rounded-xl px-3 py-2 text-sm outline-none focus:border-moderate-green text-deep-bluish transition-colors"
                />
                <button
                  onClick={addCustomInterest}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-deep-bluish"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {allInterests.map(interest => {
                  const selected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() =>
                        setInterests(prev =>
                          prev.includes(interest)
                            ? prev.filter(i => i !== interest)
                            : [...prev, interest]
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selected
                          ? 'text-white border-transparent bg-moderate-green'
                          : 'text-moderate-green/70 border-laurel-green/20 hover:border-moderate-green hover:text-moderate-green'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Save */}
            <div className="flex items-center gap-3 justify-end pb-8">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <Check size={15} /> Saved successfully
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isPending || isLoading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 bg-deep-bluish"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </main>
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default SettingsPage;
