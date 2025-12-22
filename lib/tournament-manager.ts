import { v4 as uuidv4 } from 'uuid';
import {
  Participant,
  Match,
  Round,
  TournamentData,
  TournamentFormat,
  TournamentState,
} from './types';

const STORAGE_KEY = 'tournament_data';
const THREE_WAY_THRESHOLD = 30;

// ローカルストレージからデータを読み込む
export function loadTournamentState(): TournamentState | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

// ローカルストレージにデータを保存する
export function saveTournamentState(state: TournamentState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// トーナメントをリセット
export function resetTournament(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// 配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// シード参加者を設定（奇数人数の場合）
export function assignSeed(participants: Participant[]): Participant[] {
  if (participants.length % 2 === 0) {
    return participants.map(p => ({ ...p, isSeed: false }));
  }
  
  const randomIndex = Math.floor(Math.random() * participants.length);
  return participants.map((p, i) => ({
    ...p,
    isSeed: i === randomIndex,
  }));
}

// 2倍対戦相手を作成
function createDoubleOpponent(): Participant {
  return {
    id: uuidv4(),
    name: '2倍',
    frames: 1,
    isSeed: false,
    isSpecialOpponent: true,
  };
}

// 必要なラウンド数を計算
function calculateRoundsNeeded(participantCount: number): number {
  if (participantCount <= 1) return 0;
  return Math.ceil(Math.log2(participantCount));
}

// 1v1トーナメントを生成
function generate1v1Tournament(participants: Participant[]): TournamentData {
  const shuffled = shuffleArray(participants);
  const seedParticipants = shuffled.filter(p => p.isSeed);
  const normalParticipants = shuffled.filter(p => !p.isSeed);
  
  const rounds: Round[] = [];
  const roundCount = calculateRoundsNeeded(participants.length);
  
  // 最初のラウンドを作成
  const firstRoundMatches: Match[] = [];
  let matchIndex = 0;
  
  // 通常参加者のペアリング
  for (let i = 0; i < normalParticipants.length; i += 2) {
    const match: Match = {
      id: uuidv4(),
      participants: [normalParticipants[i]],
      winner: null,
      status: 'pending',
      matchIndex: matchIndex++,
    };
    
    if (i + 1 < normalParticipants.length) {
      match.participants.push(normalParticipants[i + 1]);
      match.status = 'ready';
    }
    
    firstRoundMatches.push(match);
  }
  
  // シード参加者は2倍との対戦
  for (const seedParticipant of seedParticipants) {
    const match: Match = {
      id: uuidv4(),
      participants: [seedParticipant, createDoubleOpponent()],
      winner: null,
      status: 'ready',
      matchIndex: matchIndex++,
    };
    firstRoundMatches.push(match);
  }
  
  rounds.push({
    roundNumber: 1,
    matches: firstRoundMatches,
  });
  
  // 以降のラウンドを作成（空の対戦枠）
  let matchesInRound = Math.ceil(firstRoundMatches.length / 2);
  for (let round = 2; round <= roundCount; round++) {
    const roundMatches: Match[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      roundMatches.push({
        id: uuidv4(),
        participants: [],
        winner: null,
        status: 'pending',
        matchIndex: i,
      });
    }
    rounds.push({
      roundNumber: round,
      matches: roundMatches,
    });
    matchesInRound = Math.ceil(matchesInRound / 2);
  }
  
  return {
    rounds,
    winner: null,
    format: '1v1',
    totalParticipants: participants.length,
  };
}

// 3人対戦トーナメントを生成
function generate3WayTournament(participants: Participant[]): TournamentData {
  const shuffled = shuffleArray(participants);
  const seedParticipants = shuffled.filter(p => p.isSeed);
  const normalParticipants = shuffled.filter(p => !p.isSeed);
  
  const rounds: Round[] = [];
  
  // 最初のラウンド（3人対戦）
  const firstRoundMatches: Match[] = [];
  let matchIndex = 0;
  
  for (let i = 0; i < normalParticipants.length; i += 3) {
    const matchParticipants = normalParticipants.slice(i, Math.min(i + 3, normalParticipants.length));
    const match: Match = {
      id: uuidv4(),
      participants: matchParticipants,
      winner: null,
      status: matchParticipants.length >= 2 ? 'ready' : 'pending',
      matchIndex: matchIndex++,
    };
    firstRoundMatches.push(match);
  }
  
  rounds.push({
    roundNumber: 1,
    matches: firstRoundMatches,
  });
  
  // 2回戦以降の計算（1v1形式）
  const winnersFromFirstRound = firstRoundMatches.length;
  const totalSecondRound = winnersFromFirstRound + seedParticipants.length;
  const roundCount = 1 + calculateRoundsNeeded(totalSecondRound);
  
  // 2回戦以降のラウンドを作成
  let matchesInRound = Math.ceil(totalSecondRound / 2);
  for (let round = 2; round <= roundCount; round++) {
    const roundMatches: Match[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      roundMatches.push({
        id: uuidv4(),
        participants: [],
        winner: null,
        status: 'pending',
        matchIndex: i,
      });
    }
    rounds.push({
      roundNumber: round,
      matches: roundMatches,
    });
    matchesInRound = Math.ceil(matchesInRound / 2);
  }
  
  // シード参加者を2回戦に配置
  if (rounds.length > 1 && seedParticipants.length > 0) {
    const secondRound = rounds[1];
    for (let i = 0; i < seedParticipants.length; i++) {
      const matchIndex = Math.floor(i * secondRound.matches.length / seedParticipants.length);
      if (secondRound.matches[matchIndex]) {
        secondRound.matches[matchIndex].participants.push(seedParticipants[i]);
      }
    }
  }
  
  return {
    rounds,
    winner: null,
    format: '3way',
    totalParticipants: participants.length,
  };
}

// トーナメント形式を決定
function determineTournamentFormat(participantCount: number): TournamentFormat {
  return participantCount > THREE_WAY_THRESHOLD ? '3way' : '1v1';
}

// トーナメントを生成
export function generateTournament(participants: Participant[]): TournamentData {
  const format = determineTournamentFormat(participants.length);
  
  if (format === '3way') {
    return generate3WayTournament(participants);
  }
  
  return generate1v1Tournament(participants);
}

// 勝率を計算
export function calculateWinProbabilities(participants: Participant[]): Map<string, number> {
  const totalFrames = participants.reduce((sum, p) => sum + p.frames, 0);
  const probabilities = new Map<string, number>();
  
  participants.forEach(p => {
    probabilities.set(p.id, p.frames / totalFrames);
  });
  
  return probabilities;
}

// ルーレットで勝者を決定
export function determineWinner(participants: Participant[]): Participant {
  const totalFrames = participants.reduce((sum, p) => sum + p.frames, 0);
  const random = Math.random() * totalFrames;
  
  let accumulated = 0;
  for (const participant of participants) {
    accumulated += participant.frames;
    if (random <= accumulated) {
      return participant;
    }
  }
  
  return participants[participants.length - 1];
}

// 対戦結果を記録
export function recordMatchResult(
  tournamentData: TournamentData,
  matchId: string,
  winnerId: string
): TournamentData {
  const newData = JSON.parse(JSON.stringify(tournamentData)) as TournamentData;
  
  // 対戦を検索
  let foundRoundIndex = -1;
  let foundMatchIndex = -1;
  let match: Match | null = null;
  
  for (let ri = 0; ri < newData.rounds.length; ri++) {
    for (let mi = 0; mi < newData.rounds[ri].matches.length; mi++) {
      if (newData.rounds[ri].matches[mi].id === matchId) {
        foundRoundIndex = ri;
        foundMatchIndex = mi;
        match = newData.rounds[ri].matches[mi];
        break;
      }
    }
    if (match) break;
  }
  
  if (!match) {
    throw new Error('対戦が見つかりません');
  }
  
  // 勝者を取得
  const winner = match.participants.find(p => p.id === winnerId);
  if (!winner) {
    throw new Error('勝者が参加者に含まれていません');
  }
  
  // 2倍対戦の場合、勝者の枠数を2倍に
  const isDoubleMatch = match.participants.some(p => p.isSpecialOpponent);
  
  // 枠数を吸収
  const absorbedFrames = match.participants
    .filter(p => p.id !== winnerId && !p.isSpecialOpponent)
    .reduce((sum, p) => sum + p.frames, 0);
  
  const updatedWinner: Participant = {
    ...winner,
    frames: isDoubleMatch ? winner.frames * 2 : winner.frames + absorbedFrames,
    isSeed: false,
  };
  
  // 対戦結果を更新
  match.winner = winnerId;
  match.status = 'completed';
  
  // 次のラウンドに勝者を配置
  const nextRoundIndex = foundRoundIndex + 1;
  if (nextRoundIndex < newData.rounds.length) {
    const nextMatchIndex = Math.floor(foundMatchIndex / 2);
    const nextRound = newData.rounds[nextRoundIndex];
    
    if (nextRound.matches[nextMatchIndex]) {
      nextRound.matches[nextMatchIndex].participants.push(updatedWinner);
      
      // 次の対戦が2人揃ったらreadyに
      if (nextRound.matches[nextMatchIndex].participants.length >= 2) {
        nextRound.matches[nextMatchIndex].status = 'ready';
      }
    }
  } else {
    // 最終ラウンドの場合、優勝者を設定
    newData.winner = updatedWinner;
  }
  
  return newData;
}

// シードを進出させる（1人対戦の場合）
export function advanceSeedMatch(
  tournamentData: TournamentData,
  matchId: string
): TournamentData {
  const newData = JSON.parse(JSON.stringify(tournamentData)) as TournamentData;
  
  // 対戦を検索
  let foundRoundIndex = -1;
  let foundMatchIndex = -1;
  let match: Match | null = null;
  
  for (let ri = 0; ri < newData.rounds.length; ri++) {
    for (let mi = 0; mi < newData.rounds[ri].matches.length; mi++) {
      if (newData.rounds[ri].matches[mi].id === matchId) {
        foundRoundIndex = ri;
        foundMatchIndex = mi;
        match = newData.rounds[ri].matches[mi];
        break;
      }
    }
    if (match) break;
  }
  
  if (!match || match.participants.length !== 1) {
    throw new Error('シード進出できません');
  }
  
  const participant = match.participants[0];
  const updatedParticipant: Participant = {
    ...participant,
    frames: participant.frames * 2,
    isSeed: false,
  };
  
  match.winner = participant.id;
  match.status = 'completed';
  
  // 次のラウンドに配置
  const nextRoundIndex = foundRoundIndex + 1;
  if (nextRoundIndex < newData.rounds.length) {
    const nextMatchIndex = Math.floor(foundMatchIndex / 2);
    const nextRound = newData.rounds[nextRoundIndex];
    
    if (nextRound.matches[nextMatchIndex]) {
      nextRound.matches[nextMatchIndex].participants.push(updatedParticipant);
      
      if (nextRound.matches[nextMatchIndex].participants.length >= 2) {
        nextRound.matches[nextMatchIndex].status = 'ready';
      }
    }
  } else {
    newData.winner = updatedParticipant;
  }
  
  return newData;
}

// 全ラウンドが完了したかチェック
export function isTournamentComplete(tournamentData: TournamentData): boolean {
  return tournamentData.winner !== null;
}

// 次に実行可能な対戦を取得
export function getNextReadyMatch(tournamentData: TournamentData): Match | null {
  for (const round of tournamentData.rounds) {
    for (const match of round.matches) {
      if (match.status === 'ready') {
        return match;
      }
    }
  }
  return null;
}

