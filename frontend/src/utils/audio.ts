// Simple Web Audio API sound synthesizer for refreshing fizzy bubbles
class FizzAudioPlayer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public playFizz() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      // Synthesize 4 quick microscopic pop bubbles
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 600 + Math.random() * 800;
        const endFreq = startFreq + 400 + Math.random() * 300;

        osc.frequency.setValueAtTime(startFreq, now + i * 0.05);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + i * 0.05 + 0.06);

        gain.gain.setValueAtTime(0.04, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.07);
      }
    } catch {
      // Audio playback fails gracefully if blocked by autoplay policies
    }
  }
}

export const fizzAudio = new FizzAudioPlayer();
