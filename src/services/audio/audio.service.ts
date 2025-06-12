import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio('assets/audio/terminal_crawler.mp3');
  private hasStarted = false;

  constructor() {
    this.audio.loop = true;
    this.audio.volume = 0.5;

    const triggerAudio = () => {
      this.triggerPlayback();
      window.removeEventListener('click', triggerAudio);
      window.removeEventListener('keydown', triggerAudio);
    };

    window.addEventListener('click', triggerAudio);
    window.addEventListener('keydown', triggerAudio);
  }

  triggerPlayback() {
    if (!this.hasStarted) {
      this.audio.play().catch(err => {
        console.error('Audio playback failed:', err);
      });
      this.hasStarted = true;
    }
  }

  pause() {
    this.audio.pause();
  }

  setVolume(vol: number) {
    this.audio.volume = vol;
  }
}
