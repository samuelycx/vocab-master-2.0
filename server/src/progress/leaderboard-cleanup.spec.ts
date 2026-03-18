import {
  buildLeaderboardCleanupCandidates,
  buildLeaderboardCleanupTransactionPlan,
  summarizeLeaderboardCleanupDryRun,
  validateLeaderboardCleanupManifest,
  type LeaderboardCleanupManifest,
  type LeaderboardCleanupUserRow,
} from './leaderboard-cleanup';

describe('leaderboard cleanup toolkit', () => {
  const candidateRows: LeaderboardCleanupUserRow[] = [
    {
      id: 'user-bot',
      username: 'bot_1711111111',
      nickname: null,
      avatar: '🎓',
      level: 12,
      xp: 2800,
      coins: 0,
      streak: 0,
      totalCorrect: 0,
      studyRecordCount: 0,
      achievementCount: 0,
      followerCount: 0,
      followingCount: 0,
      matchParticipantCount: 0,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-18T00:00:00.000Z',
    },
    {
      id: 'user-real',
      username: 'learner_amy',
      nickname: 'Amy',
      avatar: '/uploads/avatar-amy.png',
      level: 8,
      xp: 1200,
      coins: 300,
      streak: 6,
      totalCorrect: 120,
      studyRecordCount: 90,
      achievementCount: 4,
      followerCount: 2,
      followingCount: 3,
      matchParticipantCount: 8,
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: '2026-03-18T00:00:00.000Z',
    },
  ];

  it('detects suspicious leaderboard candidates from user rows', () => {
    const candidates = buildLeaderboardCleanupCandidates(candidateRows);

    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      userId: 'user-bot',
      username: 'bot_1711111111',
    });
    expect(candidates[0].score).toBeGreaterThanOrEqual(4);
    expect(candidates[0].reasons).toEqual(
      expect.arrayContaining([
        'suspicious_username',
        'default_profile_shell',
        'leaderboard_without_progress',
      ]),
    );
  });

  it('validates approved cleanup manifests against exported candidates', () => {
    const [candidate] = buildLeaderboardCleanupCandidates(candidateRows);
    const manifest: LeaderboardCleanupManifest = {
      manifestVersion: 1,
      exportedAt: '2026-03-18T08:00:00.000Z',
      backupReference: {
        path: 'backups/leaderboard-cleanup-2026-03-18.sqlite',
        createdAt: '2026-03-18T08:05:00.000Z',
      },
      approvals: [
        {
          reviewer: 'ops-owner',
          approvedAt: '2026-03-18T09:00:00.000Z',
          note: 'confirmed virtual accounts after manual review',
        },
      ],
      entries: [
        {
          userId: 'user-bot',
          username: 'bot_1711111111',
          reviewDecision: 'DELETE',
          note: 'seeded account used for leaderboard demo',
          sourceCandidateScore: candidate.score,
          sourceReasons: [...candidate.reasons],
        },
      ],
    };

    expect(() =>
      validateLeaderboardCleanupManifest(manifest, {
        candidates: buildLeaderboardCleanupCandidates(candidateRows),
        requireApprovedDeletes: true,
      }),
    ).not.toThrow();

    expect(() =>
      validateLeaderboardCleanupManifest(
        {
          ...manifest,
          approvals: [],
        },
        {
          candidates: buildLeaderboardCleanupCandidates(candidateRows),
          requireApprovedDeletes: true,
        },
      ),
    ).toThrow('Cleanup manifest must contain at least one manual approval');
  });

  it('builds a dry-run summary from approved manifest entries', () => {
    const manifest: LeaderboardCleanupManifest = {
      manifestVersion: 1,
      exportedAt: '2026-03-18T08:00:00.000Z',
      backupReference: {
        path: 'backups/leaderboard-cleanup-2026-03-18.sqlite',
        createdAt: '2026-03-18T08:05:00.000Z',
      },
      approvals: [
        {
          reviewer: 'ops-owner',
          approvedAt: '2026-03-18T09:00:00.000Z',
        },
      ],
      entries: [
        {
          userId: 'user-bot',
          username: 'bot_1711111111',
          reviewDecision: 'DELETE',
          note: 'confirmed bot account',
          sourceCandidateScore: 5,
          sourceReasons: ['suspicious_username', 'leaderboard_without_progress'],
        },
      ],
    };

    const summary = summarizeLeaderboardCleanupDryRun(candidateRows, manifest);

    expect(summary.totals).toEqual({
      users: 1,
      studyRecords: 0,
      userAchievements: 0,
      follows: 0,
      matchParticipants: 0,
    });
    expect(summary.users[0]).toMatchObject({
      userId: 'user-bot',
      username: 'bot_1711111111',
    });
  });

  it('generates an explicit transaction plan instead of heuristic direct deletion', () => {
    const manifest: LeaderboardCleanupManifest = {
      manifestVersion: 1,
      exportedAt: '2026-03-18T08:00:00.000Z',
      backupReference: {
        path: 'backups/leaderboard-cleanup-2026-03-18.sqlite',
        createdAt: '2026-03-18T08:05:00.000Z',
      },
      approvals: [
        {
          reviewer: 'ops-owner',
          approvedAt: '2026-03-18T09:00:00.000Z',
        },
      ],
      entries: [
        {
          userId: 'user-bot',
          username: 'bot_1711111111',
          reviewDecision: 'DELETE',
          note: 'confirmed bot account',
          sourceCandidateScore: 5,
          sourceReasons: ['suspicious_username', 'leaderboard_without_progress'],
        },
      ],
    };

    const summary = summarizeLeaderboardCleanupDryRun(candidateRows, manifest);
    const plan = buildLeaderboardCleanupTransactionPlan(summary);

    expect(plan.userIds).toEqual(['user-bot']);
    expect(plan.operations.map((operation) => operation.table)).toEqual([
      'UserAchievement',
      'StudyRecord',
      'Follow',
      'MatchParticipant',
      'User',
    ]);
    expect(plan.operations[4]).toMatchObject({
      table: 'User',
      action: 'deleteMany',
      expectedCount: 1,
    });
  });
});
