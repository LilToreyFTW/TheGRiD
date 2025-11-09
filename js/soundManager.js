// ADDED - Complete Sound System for GRiD
import * as THREE from 'three';

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.music = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.masterVolume = 1.0;
        this.enabled = true;
        
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    // Create a sound from frequency (procedural audio for arcade feel)
    createTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext || !this.enabled) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume * this.masterVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);

        return oscillator;
    }

    // Arcade-style sound effects
    playCollect() {
        // Upward arpeggio for collection
        this.createTone(440, 0.1, 'square', 0.2);
        setTimeout(() => this.createTone(554, 0.1, 'square', 0.2), 50);
        setTimeout(() => this.createTone(659, 0.1, 'square', 0.2), 100);
    }

    playJump() {
        // Quick beep for jump
        this.createTone(300, 0.1, 'square', 0.15);
    }

    playDamage() {
        // Low rumble for damage
        this.createTone(150, 0.2, 'sawtooth', 0.3);
    }

    playHeal() {
        // Pleasant chime for healing
        this.createTone(523, 0.15, 'sine', 0.2);
        setTimeout(() => this.createTone(659, 0.15, 'sine', 0.2), 75);
    }

    playUI() {
        // UI click sound
        this.createTone(800, 0.05, 'square', 0.1);
    }

    playError() {
        // Error sound
        this.createTone(200, 0.2, 'sawtooth', 0.2);
        setTimeout(() => this.createTone(150, 0.2, 'sawtooth', 0.2), 100);
    }

    playSuccess() {
        // Success fanfare
        this.createTone(523, 0.1, 'square', 0.2);
        setTimeout(() => this.createTone(659, 0.1, 'square', 0.2), 100);
        setTimeout(() => this.createTone(784, 0.2, 'square', 0.2), 200);
    }

    // Background music generator (procedural arcade music)
    startMusic() {
        if (!this.audioContext || !this.enabled) return;
        
        this.stopMusic();
        
        const playNote = (freq, time, duration) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'square';
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime + time);
            gain.gain.linearRampToValueAtTime(0.1 * this.musicVolume * this.masterVolume, this.audioContext.currentTime + time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + duration);
            
            osc.start(this.audioContext.currentTime + time);
            osc.stop(this.audioContext.currentTime + time + duration);
        };

        // Arcade-style bass line
        const bassPattern = [110, 110, 123, 110, 98, 110, 123, 110];
        const melodyPattern = [440, 523, 659, 523, 440, 392, 440, 523];
        
        const playLoop = () => {
            const startTime = this.audioContext.currentTime;
            
            // Bass
            bassPattern.forEach((freq, i) => {
                playNote(freq, startTime + i * 0.25, 0.2);
            });
            
            // Melody
            melodyPattern.forEach((freq, i) => {
                playNote(freq, startTime + i * 0.25, 0.15);
            });
            
            if (this.musicPlaying) {
                setTimeout(playLoop, 2000);
            }
        };
        
        this.musicPlaying = true;
        playLoop();
    }

    stopMusic() {
        this.musicPlaying = false;
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    enable() {
        this.enabled = true;
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    disable() {
        this.enabled = false;
        this.stopMusic();
    }
}

