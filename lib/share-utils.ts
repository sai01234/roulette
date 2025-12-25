import { toPng } from 'html-to-image';
import { Tournament } from './types';

/**
 * トーナメント情報からX/Twitter共有用のテキストを生成
 */
export function generateShareText(tournament: Tournament): string {
  const winnerName = tournament.winnerData?.name || '不明';
  const participantCount = tournament.totalParticipants;
  const frames = tournament.winnerData?.frames || 0;

  return `${tournament.name}と勝利者と今月一杯最強くんのモデレーターお願いします！

🏆 チャンピオン: ${winnerName}
📊 参加者数: ${participantCount}名
🎯 最終枠数: ${frames}

#管理権限争奪戦 #モデレーターバトルロワイヤル`;
}

/**
 * X/Twitterの投稿画面を開く
 */
export async function shareToTwitter(tournament: Tournament): Promise<void> {
  const text = generateShareText(tournament);
  const encodedText = encodeURIComponent(text);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

  // クリップボードにコピー
  try {
    await copyToClipboard(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }

  // Twitter投稿画面を開く
  window.open(twitterUrl, '_blank', 'width=550,height=420');
}

/**
 * テキストをクリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
    return;
  }

  await navigator.clipboard.writeText(text);
}

/**
 * 指定した要素をPNG画像としてキャプチャ
 */
export async function captureElement(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // html-to-imageでPNG形式に変換
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2, // 高解像度
  });

  // Data URLをBlobに変換
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return blob;
}

/**
 * Blobを画像ファイルとしてダウンロード
 */
export async function downloadImage(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // メモリ解放
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * トーナメントのスクリーンショットを撮影してダウンロード
 */
export async function downloadTournamentScreenshot(tournament: Tournament): Promise<void> {
  const elementId = 'tournament-bracket';
  const date = new Date().toISOString().split('T')[0];
  const filename = `${tournament.name}_${date}.png`;

  const blob = await captureElement(elementId);
  await downloadImage(blob, filename);
}
