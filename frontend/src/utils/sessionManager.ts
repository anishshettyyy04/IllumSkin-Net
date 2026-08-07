import type { CosmeticPreset } from '../makeup/core/CosmeticPreset';
import type { BeautyProfile } from '../beauty/BeautyIntelligenceEngine';
import type { CartItem } from '../store/useStore';
import type { SavedLookSnapshot } from './shareLook';

export interface PortableSession {
  version: string;
  timestamp: string;
  beautyProfile: BeautyProfile | null;
  preset: CosmeticPreset;
  cart: CartItem[];
  savedLooks: SavedLookSnapshot[];
  demoSettings?: Record<string, any>;
}

export class SessionManager {
  /**
   * Exports the entire application state into a portable JSON session.
   */
  public exportSession(
    preset: CosmeticPreset,
    profile: BeautyProfile | null,
    cart: CartItem[],
    savedLooks: SavedLookSnapshot[]
  ): string {
    const session: PortableSession = {
      version: "3.0", // V3 for IllumSkin-Net RC2
      timestamp: new Date().toISOString(),
      beautyProfile: profile,
      preset,
      cart,
      savedLooks
    };
    
    return JSON.stringify(session, null, 2);
  }

  /**
   * Triggers a download of the session JSON file in the browser.
   */
  public downloadSessionFile(sessionJson: string) {
    const blob = new Blob([sessionJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `illumskin-session-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Parses a session JSON string.
   */
  public importSession(jsonString: string): PortableSession {
    try {
      const data = JSON.parse(jsonString) as PortableSession;
      if (!data.version || !data.preset) {
        throw new Error("Invalid session format");
      }
      return data;
    } catch (e) {
      console.error("Failed to parse session", e);
      throw e;
    }
  }
}
