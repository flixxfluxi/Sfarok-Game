// components/AudioManager.ts
class AudioManager {
    private unlocked = false;
    private audioCache: Record<string, HTMLAudioElement> = {};

    constructor() {
        // Unlock audio on first user click
        const unlock = () => {
            this.unlocked = true;
            document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock);
    }

    play(file: string, volume = 0.5) {
        if (!this.unlocked) return; // block until first user interaction

        // cache the audio
        if (!this.audioCache[file]) {
            const audio = new Audio(file);
            audio.volume = volume;
            this.audioCache[file] = audio;
        }

        // clone to allow overlapping sounds
        const clone = this.audioCache[file].cloneNode(true) as HTMLAudioElement;
        clone.play().catch(() => {}); // prevent uncaught promise errors
    }
}

// Singleton instance
export const AudioManagerInstance = new AudioManager();
