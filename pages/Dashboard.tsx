import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { ACHIEVEMENTS, CHALLENGES, getTotalPossiblePoints, getUserProgress, LESSONS } from '../services/data';
import { useAuth } from '../contexts/AuthContext';
import AchievementIcon from '../components/AchievementIcon';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(getUserProgress());

  const totalPossiblePoints = getTotalPossiblePoints();

  useEffect(() => {
    const handleUpdate = () => setProgress(getUserProgress());
    window.addEventListener('progress_updated', handleUpdate);
    return () => window.removeEventListener('progress_updated', handleUpdate);
  }, []);

  const completedLessons = Object.keys(progress.lessons).length;
  const completedChallenges = Object.keys(progress.challenges).length;
  const pointPercentage = Math.min(100, (progress.points / (totalPossiblePoints || 1)) * 100);
  const nextLesson = LESSONS.find((lesson) => !progress.lessons[lesson.id]);

  const statusLabel = useMemo(() => {
    if (progress.points >= 100) return 'Expert';
    if (progress.points >= 40) return 'Builder';
    return 'Rookie';
  }, [progress.points]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="grid gap-4 lg:grid-cols-[1.7fr_1fr] lg:items-stretch">
        <div className="h-full rounded-3xl border border-app-line bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-app-muted">Command Center</p>
          <h1 className="text-4xl font-semibold tracking-tight text-app-ink sm:text-5xl">Welcome back, {user?.name ?? 'Engineer'}</h1>
          <p className="mt-3 max-w-2xl text-base text-app-muted sm:text-lg">Keep momentum this week: finish a lesson, run a challenge, and log one improvement to your driver controls.</p>
        </div>

        <div className="h-full rounded-3xl border border-app-line bg-app-panel p-6 shadow-sm sm:p-8">
          <div className="flex h-full flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-app-muted">Mastery XP</p>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-app-ink">{progress.points}</p>
            <p className="text-lg text-app-muted">of {totalPossiblePoints} possible</p>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-3xl border border-app-line bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-app-muted">Progress</p>
          <p className="text-base font-semibold text-app-ink">{Math.round(pointPercentage)}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-app-panel">
          <div className="h-full rounded-full bg-gradient-to-r from-app-accent to-app-accent-2 transition-all duration-700" style={{ width: `${pointPercentage}%` }} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          {nextLesson ? (
            <section className="rounded-3xl border border-app-line bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-app-panel px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-app-muted">
                <Sparkles size={13} className="text-app-accent" />
                Recommended Next Step
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-app-ink">Lesson {nextLesson.order}: {nextLesson.title}</h2>
              <p className="mt-2 text-base text-app-muted sm:text-lg">{nextLesson.description}</p>
              <Link to={`/lessons/${nextLesson.id}`} className="ui-primary mt-6 inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] transition-colors">
                Start lesson <ArrowRight size={14} className="ml-2" />
              </Link>
            </section>
          ) : (
            <section className="rounded-3xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm sm:p-8">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-emerald-900">Curriculum complete</h2>
              <p className="mt-2 text-base text-emerald-800">You finished every training lesson. Focus on challenge runs and code refinement drills.</p>
            </section>
          )}

          <section className="rounded-3xl border border-app-line bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-5 inline-flex items-center text-xl font-semibold tracking-tight text-app-ink">
              <Award size={18} className="mr-2 text-app-accent" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = progress.unlockedAchievements.includes(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      unlocked
                        ? 'border-app-line bg-app-panel text-app-ink'
                        : 'border-app-line/70 bg-app-panel/40 text-app-muted opacity-85'
                    }`}
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-app-panel text-app-accent opacity-90">
                      <AchievementIcon name={achievement.icon} size={18} />
                    </div>
                    <h3 className="mt-2 text-base font-semibold leading-tight">{achievement.title}</h3>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-app-line bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-app-muted">Stats</h3>
            <div className="space-y-3 text-base">
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Lessons complete</span>
                <span className="font-semibold text-app-ink">{completedLessons} / {LESSONS.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Challenges complete</span>
                <span className="font-semibold text-app-ink">{completedChallenges} / {CHALLENGES.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-app-muted">Current rank</span>
                <span className="inline-flex items-center rounded-full bg-app-panel px-2.5 py-1 text-sm font-semibold text-app-ink">{statusLabel}</span>
              </div>
            </div>
          </section>

          <section className="ui-spotlight rounded-3xl border border-app-line p-6 shadow-sm">
            <h3 className="mb-2 inline-flex items-center text-base font-semibold uppercase tracking-[0.12em]">
              <Trophy size={15} className="mr-2 text-app-accent-2" />
              Daily Focus
            </h3>
            <p className="text-base">Run 2 simulator challenges without hints to build match-ready confidence.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
