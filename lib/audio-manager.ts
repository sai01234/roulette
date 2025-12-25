/**
 * オーディオマネージャー
 * アプリケーション全体の効果音を管理するシングルトンクラス
 */
class AudioManager {
  private sounds: Map<string, HTMLAudioElement>;
  private enabled: boolean;
  private readonly STORAGE_KEY = 'sound-enabled';

  constructor() {
    this.sounds = new Map();
    // LocalStorageから設定を読み込み（デフォルトは有効）
    this.enabled = this.loadEnabledState();
  }

  /**
   * LocalStorageから音声有効/無効の状態を読み込み
   */
  private loadEnabledState(): boolean {
    if (typeof window === 'undefined') return true;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch (error) {
      console.error('Failed to load sound settings:', error);
      return true;
    }
  }

  /**
   * LocalStorageに音声有効/無効の状態を保存
   */
  private saveEnabledState(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, String(this.enabled));
    } catch (error) {
      console.error('Failed to save sound settings:', error);
    }
  }

  /**
   * 効果音をプリロード
   * @param soundId 効果音ID
   * @param url 効果音ファイルのURL
   */
  preload(soundId: string, url: string): void {
    if (typeof window === 'undefined') return;

    if (this.sounds.has(soundId)) {
      return; // 既にロード済み
    }

    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds.set(soundId, audio);
    } catch (error) {
      console.error(`Failed to preload sound: ${soundId}`, error);
    }
  }

  /**
   * 効果音を再生
   * @param soundId 効果音ID
   * @param volume 音量 (0.0 - 1.0)
   */
  play(soundId: string, volume: number = 0.5): void {
    if (!this.enabled) return;
    if (typeof window === 'undefined') return;

    const audio = this.sounds.get(soundId);
    if (!audio) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    try {
      // 既に再生中の場合は停止してリセット
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }

      audio.volume = Math.max(0, Math.min(1, volume));

      // ブラウザのAutoplay Policy対策
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Autoplay prevented for: ${soundId}`, error);
        });
      }
    } catch (error) {
      console.error(`Failed to play sound: ${soundId}`, error);
    }
  }

  /**
   * 効果音を停止
   * @param soundId 効果音ID
   */
  stop(soundId: string): void {
    const audio = this.sounds.get(soundId);
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      console.error(`Failed to stop sound: ${soundId}`, error);
    }
  }

  /**
   * 音声有効/無効を設定
   * @param enabled 有効にする場合true
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveEnabledState();

    // 無効にする場合、全ての効果音を停止
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * 音声が有効かどうかを取得
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 全ての効果音を停止
   */
  private stopAll(): void {
    this.sounds.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        // エラーは無視
      }
    });
  }

  /**
   * プリロードされた全ての効果音をクリア
   */
  clear(): void {
    this.stopAll();
    this.sounds.clear();
  }
}

// シングルトンインスタンス
export const audioManager = new AudioManager();
