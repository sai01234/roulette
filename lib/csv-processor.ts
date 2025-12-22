import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { Participant, CSVProcessResult } from './types';

const MAX_PARTICIPANTS = 100;

export function processCSV(csvText: string): CSVProcessResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const participants: Participant[] = [];

  try {
    const result = Papa.parse<string[]>(csvText, {
      skipEmptyLines: true,
    });

    if (result.errors.length > 0) {
      errors.push('CSVファイルの解析に失敗しました');
      return { success: false, errors };
    }

    const rows = result.data;

    if (rows.length === 0) {
      errors.push('CSVファイルにデータがありません');
      return { success: false, errors };
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNumber = i + 1;

      // 空の行をスキップ
      if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) {
        continue;
      }

      // 列数チェック
      if (row.length < 2) {
        errors.push(`${lineNumber}行目のフォーマットが不正です（2列必要です）`);
        continue;
      }

      const name = row[0].trim();
      const framesStr = row[1].trim();

      // 参加者名チェック
      if (!name) {
        errors.push(`${lineNumber}行目: 参加者名が未入力です`);
        continue;
      }

      // 枠数チェック
      const frames = parseInt(framesStr, 10);
      if (isNaN(frames) || frames < 1) {
        errors.push(`${lineNumber}行目: 枠数は1以上の整数である必要があります`);
        continue;
      }

      participants.push({
        id: uuidv4(),
        name,
        frames,
        isSeed: false,
      });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (participants.length === 0) {
      errors.push('有効な参加者データがありません');
      return { success: false, errors };
    }

    if (participants.length > MAX_PARTICIPANTS) {
      warnings.push(`参加者数が${MAX_PARTICIPANTS}名を超えています（${participants.length}名）。処理は続行されますが、パフォーマンスに影響する可能性があります。`);
    }

    return {
      success: true,
      participants,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    errors.push('CSVファイルの文字コードが不正です。UTF-8形式で保存してください。');
    return { success: false, errors };
  }
}

export function parseCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    reader.readAsText(file, 'UTF-8');
  });
}

