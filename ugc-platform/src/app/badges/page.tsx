"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Trophy, 
  Award, 
  Star, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  Zap,
  Target,
  Crown,
  Medal,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface UserStats {
  totalEarnings: number;
  totalViews: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  totalBounties: number;
}

interface Level {
  level: number;
  name: string;
  icon: React.ReactNode;
  minEarnings: number;
  minViews: number;
  minSubmissions: number;
  color: string;
  description: string;
}

const levels: Level[] = [
  {
    level: 1,
    name: "Beginner",
    icon: <Star className="h-6 w-6" />,
    minEarnings: 0,
    minViews: 0,
    minSubmissions: 0,
    color: "#94A3B8",
    description: "Just getting started on your UGC journey"
  },
  {
    level: 2,
    name: "Rising Star",
    icon: <Zap className="h-6 w-6" />,
    minEarnings: 100,
    minViews: 10000,
    minSubmissions: 3,
    color: "#60A5FA",
    description: "Building momentum with your content"
  },
  {
    level: 3,
    name: "Content Creator",
    icon: <Award className="h-6 w-6" />,
    minEarnings: 500,
    minViews: 50000,
    minSubmissions: 10,
    color: "#34D399",
    description: "Established creator making an impact"
  },
  {
    level: 4,
    name: "Influencer",
    icon: <Trophy className="h-6 w-6" />,
    minEarnings: 2000,
    minViews: 200000,
    minSubmissions: 25,
    color: "#FBBF24",
    description: "Recognized influencer in the community"
  },
  {
    level: 5,
    name: "Top Creator",
    icon: <Medal className="h-6 w-6" />,
    minEarnings: 5000,
    minViews: 500000,
    minSubmissions: 50,
    color: "#F59E0B",
    description: "Elite creator with exceptional reach"
  },
  {
    level: 6,
    name: "Master Creator",
    icon: <Crown className="h-6 w-6" />,
    minEarnings: 10000,
    minViews: 1000000,
    minSubmissions: 100,
    color: "#A855F7",
    description: "Master of UGC creation"
  },
  {
    level: 7,
    name: "Legend",
    icon: <Sparkles className="h-6 w-6" />,
    minEarnings: 25000,
    minViews: 5000000,
    minSubmissions: 200,
    color: "#EC4899",
    description: "Legendary status in the UGC world"
  }
];

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  requirement: string;
}

const badges: Badge[] = [
  {
    id: "first-submission",
    name: "First Steps",
    description: "Submit your first piece of content",
    icon: <Target className="h-5 w-5" />,
    unlocked: false,
    requirement: "1 submission"
  },
  {
    id: "first-approval",
    name: "Approved",
    description: "Get your first submission approved",
    icon: <CheckCircle className="h-5 w-5" />,
    unlocked: false,
    requirement: "1 approved submission"
  },
  {
    id: "hundred-views",
    name: "Hundred Views",
    description: "Reach 100 total views",
    icon: <Eye className="h-5 w-5" />,
    unlocked: false,
    requirement: "100 views"
  },
  {
    id: "thousand-views",
    name: "Thousand Views",
    description: "Reach 1,000 total views",
    icon: <Eye className="h-5 w-5" />,
    unlocked: false,
    requirement: "1,000 views"
  },
  {
    id: "hundred-earnings",
    name: "First Hundred",
    description: "Earn your first $100",
    icon: <DollarSign className="h-5 w-5" />,
    unlocked: false,
    requirement: "$100 earned"
  },
  {
    id: "thousand-earnings",
    name: "Thousand Dollar Club",
    description: "Earn $1,000 total",
    icon: <DollarSign className="h-5 w-5" />,
    unlocked: false,
    requirement: "$1,000 earned"
  },
  {
    id: "ten-submissions",
    name: "Consistent Creator",
    description: "Submit 10 pieces of content",
    icon: <TrendingUp className="h-5 w-5" />,
    unlocked: false,
    requirement: "10 submissions"
  },
  {
    id: "fifty-submissions",
    name: "Pro Creator",
    description: "Submit 50 pieces of content",
    icon: <TrendingUp className="h-5 w-5" />,
    unlocked: false,
    requirement: "50 submissions"
  }
];

function calculateCurrentLevel(stats: UserStats): Level {
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i];
    if (
      stats.totalEarnings >= level.minEarnings &&
      stats.totalViews >= level.minViews &&
      stats.totalSubmissions >= level.minSubmissions
    ) {
      return level;
    }
  }
  return levels[0];
}

function calculateNextLevel(currentLevel: Level): Level | null {
  const currentIndex = levels.findIndex(l => l.level === currentLevel.level);
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return null;
}

function calculateProgress(stats: UserStats, currentLevel: Level, nextLevel: Level | null): number {
  if (!nextLevel) return 100;
  
  const currentProgress = Math.max(
    (stats.totalEarnings / nextLevel.minEarnings) * 0.4,
    (stats.totalViews / nextLevel.minViews) * 0.3,
    (stats.totalSubmissions / nextLevel.minSubmissions) * 0.3
  );
  
  return Math.min(100, currentProgress * 100);
}

export default function BadgesPage() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();
  const [stats, setStats] = useState<UserStats>({
    totalEarnings: 0,
    totalViews: 0,
    totalSubmissions: 0,
    approvedSubmissions: 0,
    totalBounties: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && isLoaded) {
      fetchUserStats();
    }
  }, [user, isLoaded]);

  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch submissions
      const submissionsResponse = await fetch("/api/submissions");
      const submissionsData = submissionsResponse.ok ? await submissionsResponse.json() : [];
      
      // Fetch bounties created by user
      const bountiesResponse = await fetch("/api/bounties");
      const bountiesData = bountiesResponse.ok ? await bountiesResponse.json() : [];
      const userBounties = bountiesData.filter((b: any) => b.creator_id === user?.id);

      const totalEarnings = submissionsData.reduce((sum: number, sub: any) => sum + (sub.earned_amount || 0), 0);
      const totalViews = submissionsData.reduce((sum: number, sub: any) => sum + (sub.view_count || 0), 0);
      const totalSubmissions = submissionsData.length;
      const approvedSubmissions = submissionsData.filter((sub: any) => sub.status === "approved").length;

      setStats({
        totalEarnings,
        totalViews,
        totalSubmissions,
        approvedSubmissions,
        totalBounties: userBounties.length,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className={`min-h-screen transition-colors ${
        theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
      } flex items-center justify-center`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          theme === "light" ? "border-[#1B3C73]" : "border-[#60A5FA]"
        }`}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentLevel = calculateCurrentLevel(stats);
  const nextLevel = calculateNextLevel(currentLevel);
  const progress = calculateProgress(stats, currentLevel, nextLevel);

  // Calculate unlocked badges
  const unlockedBadges = badges.map(badge => {
    let unlocked = false;
    switch (badge.id) {
      case "first-submission":
        unlocked = stats.totalSubmissions >= 1;
        break;
      case "first-approval":
        unlocked = stats.approvedSubmissions >= 1;
        break;
      case "hundred-views":
        unlocked = stats.totalViews >= 100;
        break;
      case "thousand-views":
        unlocked = stats.totalViews >= 1000;
        break;
      case "hundred-earnings":
        unlocked = stats.totalEarnings >= 100;
        break;
      case "thousand-earnings":
        unlocked = stats.totalEarnings >= 1000;
        break;
      case "ten-submissions":
        unlocked = stats.totalSubmissions >= 10;
        break;
      case "fifty-submissions":
        unlocked = stats.totalSubmissions >= 50;
        break;
    }
    return { ...badge, unlocked };
  });

  return (
    <div className={`min-h-screen transition-colors ${
      theme === "light" ? "bg-[#E8ECF3]" : "bg-[#0A0F17]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Achievements
          </h1>
          <p className={`text-lg ${
            theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
          }`}>
            Track your progress and unlock achievements as you create content
          </p>
        </div>

        {/* Current Level Card */}
        <div className={`border rounded-lg p-8 mb-8 ${
          theme === "light"
            ? "bg-white border-[#C8D1E0]"
            : "bg-[#141B23] border-[#1A2332]"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="p-4 rounded-full"
                style={{ backgroundColor: `${currentLevel.color}20` }}
              >
                <div style={{ color: currentLevel.color }}>
                  {currentLevel.icon}
                </div>
              </div>
              <div>
                <h2 className={`text-2xl font-bold mb-1 ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  Level {currentLevel.level}: {currentLevel.name}
                </h2>
                <p className={`${
                  theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`}>
                  {currentLevel.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`}>
                  Progress to Level {nextLevel.level}: {nextLevel.name}
                </span>
                <span className={`text-sm font-medium ${
                  theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${
                theme === "light" ? "bg-[#D9E1EF]" : "bg-[#1A2332]"
              }`}>
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: nextLevel.color,
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-xs mb-1 ${
                    theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                  }`}>
                    Earnings: ${stats.totalEarnings.toFixed(2)} / ${nextLevel.minEarnings.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs mb-1 ${
                    theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                  }`}>
                    Views: {stats.totalViews.toLocaleString()} / {nextLevel.minViews.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className={`text-xs mb-1 ${
                    theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                  }`}>
                    Submissions: {stats.totalSubmissions} / {nextLevel.minSubmissions}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-4 ${
              theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
            }`}>
              <Crown className="h-8 w-8 mx-auto mb-2" style={{ color: currentLevel.color }} />
              <p className="font-semibold">You've reached the maximum level!</p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`border rounded-lg p-4 ${
            theme === "light"
              ? "bg-white border-[#C8D1E0]"
              : "bg-[#141B23] border-[#1A2332]"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`h-5 w-5 ${
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              }`} />
              <p className={`text-sm ${
                theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
              }`}>
                Total Earnings
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
            }`}>
              ${stats.totalEarnings.toFixed(2)}
            </p>
          </div>
          <div className={`border rounded-lg p-4 ${
            theme === "light"
              ? "bg-white border-[#C8D1E0]"
              : "bg-[#141B23] border-[#1A2332]"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Eye className={`h-5 w-5 ${
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              }`} />
              <p className={`text-sm ${
                theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
              }`}>
                Total Views
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
            }`}>
              {stats.totalViews.toLocaleString()}
            </p>
          </div>
          <div className={`border rounded-lg p-4 ${
            theme === "light"
              ? "bg-white border-[#C8D1E0]"
              : "bg-[#141B23] border-[#1A2332]"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className={`h-5 w-5 ${
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              }`} />
              <p className={`text-sm ${
                theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
              }`}>
                Submissions
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
            }`}>
              {stats.totalSubmissions}
            </p>
          </div>
          <div className={`border rounded-lg p-4 ${
            theme === "light"
              ? "bg-white border-[#C8D1E0]"
              : "bg-[#141B23] border-[#1A2332]"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className={`h-5 w-5 ${
                theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
              }`} />
              <p className={`text-sm ${
                theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
              }`}>
                Approved
              </p>
            </div>
            <p className={`text-2xl font-bold ${
              theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
            }`}>
              {stats.approvedSubmissions}
            </p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-8" id="badges">
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`border rounded-lg p-6 transition-all ${
                  badge.unlocked
                    ? theme === "light"
                      ? "bg-white border-[#1B3C73] shadow-md"
                      : "bg-[#141B23] border-[#60A5FA] shadow-md"
                    : theme === "light"
                      ? "bg-white border-[#C8D1E0] opacity-60"
                      : "bg-[#141B23] border-[#1A2332] opacity-60"
                }`}
              >
                <div className={`flex items-center gap-3 mb-3 ${
                  badge.unlocked
                    ? theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
                    : theme === "light" ? "text-[#6B7A8F]" : "text-[#64748B]"
                }`}>
                  {badge.icon}
                  {badge.unlocked && (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
                <h3 className={`font-bold mb-1 ${
                  theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                }`}>
                  {badge.name}
                </h3>
                <p className={`text-sm mb-2 ${
                  theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                }`}>
                  {badge.description}
                </p>
                <p className={`text-xs ${
                  theme === "light" ? "text-[#6B7A8F]" : "text-[#64748B]"
                }`}>
                  {badge.requirement}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* All Levels Section */}
        <div id="levels">
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
          }`}>
            All Levels
          </h2>
          <div className="space-y-4">
            {levels.map((level) => {
              const isCurrentLevel = level.level === currentLevel.level;
              const isUnlocked = level.level <= currentLevel.level;
              
              return (
                <div
                  key={level.level}
                  className={`border rounded-lg p-6 ${
                    isCurrentLevel
                      ? theme === "light"
                        ? "bg-white border-[#1B3C73] shadow-md"
                        : "bg-[#141B23] border-[#60A5FA] shadow-md"
                      : isUnlocked
                        ? theme === "light"
                          ? "bg-white border-[#C8D1E0]"
                          : "bg-[#141B23] border-[#1A2332]"
                        : theme === "light"
                          ? "bg-white border-[#C8D1E0] opacity-60"
                          : "bg-[#141B23] border-[#1A2332] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-full"
                        style={{
                          backgroundColor: isUnlocked ? `${level.color}20` : undefined,
                        }}
                      >
                        <div style={{ color: isUnlocked ? level.color : undefined }}>
                          {level.icon}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-xl font-bold ${
                            theme === "light" ? "text-[#2E3A47]" : "text-[#F5F8FC]"
                          }`}>
                            Level {level.level}: {level.name}
                          </h3>
                          {isCurrentLevel && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              theme === "light"
                                ? "bg-[#1B3C73] text-white"
                                : "bg-[#60A5FA] text-white"
                            }`}>
                              Current
                            </span>
                          )}
                          {isUnlocked && !isCurrentLevel && (
                            <CheckCircle className={`h-5 w-5 ${
                              theme === "light" ? "text-[#1B3C73]" : "text-[#60A5FA]"
                            }`} />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          theme === "light" ? "text-[#52677C]" : "text-[#B8C5D6]"
                        }`}>
                          {level.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${
                    theme === "light" ? "border-[#C8D1E0]" : "border-[#1A2332]"
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className={`mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Earnings: ${level.minEarnings.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Views: {level.minViews.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`mb-1 ${
                          theme === "light" ? "text-[#6B7A8F]" : "text-[#B8C5D6]"
                        }`}>
                          Submissions: {level.minSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">
              Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

