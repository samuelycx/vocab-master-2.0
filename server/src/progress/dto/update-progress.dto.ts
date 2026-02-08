export class UpdateProgressDto {
    userId: string;
    wordId: string;
    status: string; // 'NEW', 'LEARNING', 'MASTERED'
    xpGained?: number;
    coinsGained?: number;
}
