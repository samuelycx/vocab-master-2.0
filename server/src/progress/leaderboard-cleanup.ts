export interface LeaderboardCleanupUserRow {
  id: string;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  totalCorrect: number;
  studyRecordCount: number;
  achievementCount: number;
  followerCount: number;
  followingCount: number;
  matchParticipantCount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LeaderboardCleanupCandidate {
  userId: string;
  username: string;
  score: number;
  reasons: string[];
  metrics: {
    xp: number;
    level: number;
    totalCorrect: number;
    studyRecordCount: number;
    achievementCount: number;
    followerCount: number;
    followingCount: number;
    matchParticipantCount: number;
  };
}

export interface LeaderboardCleanupManifestApproval {
  reviewer: string;
  approvedAt: string;
  note?: string;
}

export type LeaderboardCleanupReviewDecision = 'PENDING' | 'KEEP' | 'DELETE';

export interface LeaderboardCleanupManifestEntry {
  userId: string;
  username: string;
  reviewDecision: LeaderboardCleanupReviewDecision;
  note: string;
  sourceCandidateScore: number;
  sourceReasons: string[];
}

export interface LeaderboardCleanupManifest {
  manifestVersion: number;
  exportedAt: string;
  backupReference: {
    path: string;
    createdAt: string;
    checksum?: string;
  };
  approvals: LeaderboardCleanupManifestApproval[];
  entries: LeaderboardCleanupManifestEntry[];
}

export interface LeaderboardCleanupDryRunSummary {
  manifestVersion: number;
  exportedAt: string;
  deleteUserIds: string[];
  totals: {
    users: number;
    studyRecords: number;
    userAchievements: number;
    follows: number;
    matchParticipants: number;
  };
  users: Array<{
    userId: string;
    username: string;
    reasons: string[];
    note: string;
    counts: {
      studyRecords: number;
      userAchievements: number;
      follows: number;
      matchParticipants: number;
    };
  }>;
}

export interface LeaderboardCleanupTransactionPlan {
  userIds: string[];
  operations: Array<{
    table: 'UserAchievement' | 'StudyRecord' | 'Follow' | 'MatchParticipant' | 'User';
    action: 'deleteMany';
    expectedCount: number;
    where: Record<string, unknown>;
  }>;
}

export interface ValidateLeaderboardCleanupManifestOptions {
  candidates?: LeaderboardCleanupCandidate[];
  requireApprovedDeletes?: boolean;
}

export interface LeaderboardCleanupExportReport {
  manifestVersion: number;
  exportedAt: string;
  totalUsersScanned: number;
  candidateThreshold: number;
  backupSuggestion: {
    recommendedPath: string;
    recommendedCommand: string;
  };
  candidates: LeaderboardCleanupCandidate[];
}

const DEFAULT_AVATARS = new Set(['', '🎓']);
const CANDIDATE_SCORE_THRESHOLD = 3;

function isValidTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function ensureNonEmptyString(value: unknown, label: string): string {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    throw new Error(`${label} is required`);
  }
  return normalized;
}

function isDefaultAvatar(avatar?: string | null): boolean {
  return DEFAULT_AVATARS.has(String(avatar ?? '').trim());
}

function hasSuspiciousUsername(username: string): boolean {
  return /^(bot|guest|游客|test|demo|robot|mock)[-_0-9]*$/i.test(username.trim());
}

function collectCandidateSignals(row: LeaderboardCleanupUserRow): string[] {
  const reasons: string[] = [];
  const noProfile = !String(row.nickname ?? '').trim() && isDefaultAvatar(row.avatar);
  const noProgress =
    row.studyRecordCount === 0 &&
    row.totalCorrect === 0 &&
    row.achievementCount === 0 &&
    row.matchParticipantCount === 0;

  if (hasSuspiciousUsername(row.username)) {
    reasons.push('suspicious_username');
  }

  if (noProfile) {
    reasons.push('default_profile_shell');
  }

  if (noProgress && (row.xp >= 500 || row.level >= 5)) {
    reasons.push('leaderboard_without_progress');
  }

  if (noProgress && row.followerCount === 0 && row.followingCount === 0 && row.xp >= 1000) {
    reasons.push('no_social_or_match_activity');
  }

  return reasons;
}

function scoreCandidate(reasons: string[]): number {
  return reasons.reduce((score, reason) => {
    switch (reason) {
      case 'suspicious_username':
      case 'leaderboard_without_progress':
        return score + 2;
      default:
        return score + 1;
    }
  }, 0);
}

function buildCandidateMetrics(row: LeaderboardCleanupUserRow) {
  return {
    xp: row.xp,
    level: row.level,
    totalCorrect: row.totalCorrect,
    studyRecordCount: row.studyRecordCount,
    achievementCount: row.achievementCount,
    followerCount: row.followerCount,
    followingCount: row.followingCount,
    matchParticipantCount: row.matchParticipantCount,
  };
}

function getApprovedEntries(manifest: LeaderboardCleanupManifest): LeaderboardCleanupManifestEntry[] {
  return manifest.entries.filter((entry) => entry.reviewDecision === 'DELETE');
}

export function buildLeaderboardCleanupCandidates(
  rows: LeaderboardCleanupUserRow[],
): LeaderboardCleanupCandidate[] {
  return rows
    .map((row) => {
      const reasons = collectCandidateSignals(row);
      return {
        userId: row.id,
        username: row.username,
        score: scoreCandidate(reasons),
        reasons,
        metrics: buildCandidateMetrics(row),
      };
    })
    .filter((candidate) => candidate.score >= CANDIDATE_SCORE_THRESHOLD)
    .sort((left, right) => right.score - left.score || right.metrics.xp - left.metrics.xp);
}

export function createLeaderboardCleanupManifestTemplate(
  report: LeaderboardCleanupExportReport,
): LeaderboardCleanupManifest {
  return {
    manifestVersion: report.manifestVersion,
    exportedAt: report.exportedAt,
    backupReference: {
      path: report.backupSuggestion.recommendedPath,
      createdAt: '',
    },
    approvals: [],
    entries: report.candidates.map((candidate) => ({
      userId: candidate.userId,
      username: candidate.username,
      reviewDecision: 'PENDING',
      note: '',
      sourceCandidateScore: candidate.score,
      sourceReasons: [...candidate.reasons],
    })),
  };
}

export function buildLeaderboardCleanupExportReport(options: {
  rows: LeaderboardCleanupUserRow[];
  databasePath: string;
  backupPath: string;
}): LeaderboardCleanupExportReport {
  return {
    manifestVersion: 1,
    exportedAt: new Date().toISOString(),
    totalUsersScanned: options.rows.length,
    candidateThreshold: CANDIDATE_SCORE_THRESHOLD,
    backupSuggestion: {
      recommendedPath: options.backupPath,
      recommendedCommand: `sqlite3 "${options.databasePath}" ".backup '${options.backupPath}'"`,
    },
    candidates: buildLeaderboardCleanupCandidates(options.rows),
  };
}

export function validateLeaderboardCleanupManifest(
  manifest: LeaderboardCleanupManifest,
  options: ValidateLeaderboardCleanupManifestOptions = {},
): LeaderboardCleanupManifest {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Cleanup manifest must be an object');
  }

  if (!Number.isInteger(manifest.manifestVersion) || manifest.manifestVersion <= 0) {
    throw new Error('Cleanup manifest version must be a positive integer');
  }

  ensureNonEmptyString(manifest.exportedAt, 'Cleanup manifest exportedAt');
  if (!isValidTimestamp(manifest.exportedAt)) {
    throw new Error('Cleanup manifest exportedAt must be a valid timestamp');
  }

  if (!manifest.backupReference || typeof manifest.backupReference !== 'object') {
    throw new Error('Cleanup manifest backupReference is required');
  }

  ensureNonEmptyString(manifest.backupReference.path, 'Cleanup manifest backupReference.path');
  ensureNonEmptyString(
    manifest.backupReference.createdAt,
    'Cleanup manifest backupReference.createdAt',
  );
  if (!isValidTimestamp(manifest.backupReference.createdAt)) {
    throw new Error('Cleanup manifest backupReference.createdAt must be a valid timestamp');
  }

  if (!Array.isArray(manifest.entries) || manifest.entries.length === 0) {
    throw new Error('Cleanup manifest must contain at least one entry');
  }

  if (!Array.isArray(manifest.approvals)) {
    throw new Error('Cleanup manifest approvals must be an array');
  }

  if (options.requireApprovedDeletes && manifest.approvals.length === 0) {
    throw new Error('Cleanup manifest must contain at least one manual approval');
  }

  manifest.approvals.forEach((approval, index) => {
    ensureNonEmptyString(approval.reviewer, `Cleanup manifest approvals[${index}].reviewer`);
    ensureNonEmptyString(approval.approvedAt, `Cleanup manifest approvals[${index}].approvedAt`);
    if (!isValidTimestamp(approval.approvedAt)) {
      throw new Error(`Cleanup manifest approvals[${index}].approvedAt must be a valid timestamp`);
    }
  });

  const candidateById = new Map(
    (options.candidates ?? []).map((candidate) => [candidate.userId, candidate]),
  );
  const seenUserIds = new Set<string>();

  manifest.entries.forEach((entry, index) => {
    const userId = ensureNonEmptyString(entry.userId, `Cleanup manifest entries[${index}].userId`);
    const username = ensureNonEmptyString(
      entry.username,
      `Cleanup manifest entries[${index}].username`,
    );

    if (seenUserIds.has(userId)) {
      throw new Error(`Cleanup manifest contains duplicate userId: ${userId}`);
    }
    seenUserIds.add(userId);

    if (!['PENDING', 'KEEP', 'DELETE'].includes(entry.reviewDecision)) {
      throw new Error(
        `Cleanup manifest entries[${index}].reviewDecision must be PENDING, KEEP, or DELETE`,
      );
    }

    ensureNonEmptyString(entry.note, `Cleanup manifest entries[${index}].note`);

    if (!Number.isInteger(entry.sourceCandidateScore) || entry.sourceCandidateScore < 0) {
      throw new Error(
        `Cleanup manifest entries[${index}].sourceCandidateScore must be a non-negative integer`,
      );
    }

    if (!Array.isArray(entry.sourceReasons) || entry.sourceReasons.length === 0) {
      throw new Error(`Cleanup manifest entries[${index}].sourceReasons must be a non-empty array`);
    }

    if (candidateById.size > 0) {
      const candidate = candidateById.get(userId);
      if (!candidate) {
        throw new Error(`Cleanup manifest entry ${userId} is not present in exported candidates`);
      }
      if (candidate.username !== username) {
        throw new Error(`Cleanup manifest entry ${userId} username does not match exported data`);
      }
      if (candidate.score !== entry.sourceCandidateScore) {
        throw new Error(`Cleanup manifest entry ${userId} score does not match exported data`);
      }
      const missingReasons = entry.sourceReasons.filter(
        (reason) => !candidate.reasons.includes(String(reason)),
      );
      if (missingReasons.length > 0) {
        throw new Error(
          `Cleanup manifest entry ${userId} reasons do not match exported data: ${missingReasons.join(', ')}`,
        );
      }
    }
  });

  if (options.requireApprovedDeletes && getApprovedEntries(manifest).length === 0) {
    throw new Error('Cleanup manifest must contain at least one DELETE entry');
  }

  return manifest;
}

export function summarizeLeaderboardCleanupDryRun(
  rows: LeaderboardCleanupUserRow[],
  manifest: LeaderboardCleanupManifest,
): LeaderboardCleanupDryRunSummary {
  validateLeaderboardCleanupManifest(manifest, { requireApprovedDeletes: true });

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const approvedEntries = getApprovedEntries(manifest);
  const users = approvedEntries.map((entry) => {
    const row = rowsById.get(entry.userId);
    if (!row) {
      throw new Error(`Cleanup manifest references unknown user row: ${entry.userId}`);
    }

    return {
      userId: row.id,
      username: row.username,
      reasons: [...entry.sourceReasons],
      note: entry.note,
      counts: {
        studyRecords: row.studyRecordCount,
        userAchievements: row.achievementCount,
        follows: row.followerCount + row.followingCount,
        matchParticipants: row.matchParticipantCount,
      },
    };
  });

  return {
    manifestVersion: manifest.manifestVersion,
    exportedAt: manifest.exportedAt,
    deleteUserIds: users.map((user) => user.userId),
    totals: {
      users: users.length,
      studyRecords: users.reduce((sum, user) => sum + user.counts.studyRecords, 0),
      userAchievements: users.reduce((sum, user) => sum + user.counts.userAchievements, 0),
      follows: users.reduce((sum, user) => sum + user.counts.follows, 0),
      matchParticipants: users.reduce((sum, user) => sum + user.counts.matchParticipants, 0),
    },
    users,
  };
}

export function buildLeaderboardCleanupTransactionPlan(
  summary: LeaderboardCleanupDryRunSummary,
): LeaderboardCleanupTransactionPlan {
  const userIds = [...summary.deleteUserIds];

  return {
    userIds,
    operations: [
      {
        table: 'UserAchievement',
        action: 'deleteMany',
        expectedCount: summary.totals.userAchievements,
        where: { userId: { in: userIds } },
      },
      {
        table: 'StudyRecord',
        action: 'deleteMany',
        expectedCount: summary.totals.studyRecords,
        where: { userId: { in: userIds } },
      },
      {
        table: 'Follow',
        action: 'deleteMany',
        expectedCount: summary.totals.follows,
        where: {
          OR: [{ followerId: { in: userIds } }, { followingId: { in: userIds } }],
        },
      },
      {
        table: 'MatchParticipant',
        action: 'deleteMany',
        expectedCount: summary.totals.matchParticipants,
        where: { userId: { in: userIds } },
      },
      {
        table: 'User',
        action: 'deleteMany',
        expectedCount: summary.totals.users,
        where: { id: { in: userIds } },
      },
    ],
  };
}
