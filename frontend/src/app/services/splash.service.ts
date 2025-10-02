import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SplashService {
  // Signal semplice per controllare se mostrare header/footer
  public readonly isSplashActive = signal(false);

  // Metodo per nascondere header/footer (chiamato dalla splash page)
  showSplash() {
    this.isSplashActive.set(true);
  }

  // Metodo per mostrare header/footer (chiamato quando si esce dalla splash)
  hideSplash() {
    this.isSplashActive.set(false);
  }
}
