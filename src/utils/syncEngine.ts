import { KaraokeSong } from '../data/karaokeCatalog';

export interface RoomCommand {
  action: 'play' | 'pause' | 'togglePlay' | 'next' | 'replay' | 'toggleMute' | 'setVolume' | 'setPitch' | 'setSpeed' | 'sfx' | 'addToQueue' | 'removeFromQueue' | 'prioritize' | 'score';
  payload?: any;
  senderId?: string;
  timestamp?: number;
}

export interface AppSyncState {
  roomId: string;
  currentSong: KaraokeSong | null;
  queue: KaraokeSong[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  pitch: number;
  speed: number;
  lastUpdated?: number;
}

type CommandListener = (cmd: RoomCommand) => void;
type StateListener = (state: AppSyncState) => void;

class RoomSyncEngine {
  private localChannel: BroadcastChannel | null = null;
  private sseSource: EventSource | null = null;
  private currentRoomId: string = '6868';
  private commandListeners: Set<CommandListener> = new Set();
  private stateListeners: Set<StateListener> = new Set();
  private clientId: string = 'cli_' + Math.random().toString(36).slice(2, 10);

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localChannel = new BroadcastChannel('oanh_dien_karaoke_v2');
        this.localChannel.onmessage = (e) => {
          const { type, data } = e.data || {};
          // Prevent processing self-echoed commands
          if (data?.senderId && data.senderId === this.clientId) {
            return;
          }
          if (type === 'COMMAND') {
            this.notifyCommands(data);
          } else if (type === 'STATE') {
            this.notifyState(data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported', err);
      }
    }
  }

  public initRoom(roomId: string) {
    this.currentRoomId = (roomId || '6868').toUpperCase().trim();
    if (typeof window === 'undefined') return;

    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }

    try {
      this.sseSource = new EventSource(`/api/room/${encodeURIComponent(this.currentRoomId)}/stream`);
      
      this.sseSource.addEventListener('state', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notifyState(parsed);
        } catch (e) {
          console.error('SSE state parse error', e);
        }
      });

      this.sseSource.addEventListener('command', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          // CRITICAL: Ignore own commands echoed back from server to prevent duplicate execution
          if (parsed.senderId && parsed.senderId === this.clientId) {
            return;
          }
          this.notifyCommands(parsed);
        } catch (e) {
          console.error('SSE command parse error', e);
        }
      });

      this.sseSource.onerror = () => {
        // SSE will attempt auto-reconnect
      };
    } catch (e) {
      console.warn('SSE connection failed, relying on local sync', e);
    }

    // Immediately fetch current room state from server upon connecting
    fetch(`/api/room/${encodeURIComponent(this.currentRoomId)}/state`)
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.currentSong !== undefined || data.queue !== undefined)) {
          this.notifyState(data);
        }
      })
      .catch(() => {});
  }

  public onCommand(listener: CommandListener) {
    this.commandListeners.add(listener);
    return () => {
      this.commandListeners.delete(listener);
    };
  }

  public onState(listener: StateListener) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyCommands(cmd: RoomCommand) {
    for (const l of this.commandListeners) {
      try {
        l(cmd);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private notifyState(state: AppSyncState) {
    for (const l of this.stateListeners) {
      try {
        l(state);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public async sendCommand(cmd: RoomCommand) {
    const fullCmd: RoomCommand = {
      ...cmd,
      senderId: this.clientId,
      timestamp: Date.now(),
    };

    // 1. Local broadcast for other tabs
    if (this.localChannel) {
      this.localChannel.postMessage({ type: 'COMMAND', data: fullCmd });
    }

    // 2. Server API broadcast
    try {
      await fetch(`/api/room/${encodeURIComponent(this.currentRoomId)}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullCmd),
      });
    } catch {
      // Fallback
    }
  }

  public async syncState(state: Partial<AppSyncState>) {
    // 1. Local broadcast
    if (this.localChannel) {
      this.localChannel.postMessage({ type: 'STATE', data: state });
    }

    // 2. Server API broadcast
    try {
      await fetch(`/api/room/${encodeURIComponent(this.currentRoomId)}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
    } catch {
      // Fallback
    }
  }

  public destroy() {
    if (this.sseSource) {
      this.sseSource.close();
      this.sseSource = null;
    }
    if (this.localChannel) {
      this.localChannel.close();
      this.localChannel = null;
    }
    this.commandListeners.clear();
    this.stateListeners.clear();
  }
}

export const syncEngine = new RoomSyncEngine();
