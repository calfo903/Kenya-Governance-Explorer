/**
 * §6.2 — Peer-to-Peer Inter-County Data Sync Coordinator
 *
 * Employs raw browser-native WebRTC RTCPeerConnection and RTCDataChannel APIs
 * to coordinate decentralized peer-to-peer data sync directly between active citizen browser tabs.
 * Synchronizes county scorecard metrics and whistleblower hashes without centralized servers.
 */

export interface SyncStateVector {
  [countyCode: string]: number; // CountyCode -> Last updated timestamp (Vector clock)
}

export interface SyncPayload {
  type: 'SYNC_OFFER' | 'SYNC_REQUEST' | 'SYNC_DATA' | 'STATE_HASH_VECTOR';
  senderPeerId: string;
  vector: SyncStateVector;
  payloadData?: any;
}

export class P2PDataSyncCoordinator {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private peerId: string;
  private localVector: SyncStateVector = {};

  constructor(peerId: string) {
    this.peerId = peerId;
    this.initializeLocalVectorClock();
  }

  /** Read current county update timestamps from local stores to establish the local vector clock */
  private initializeLocalVectorClock() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('kenya_gov_sync_vector');
      if (stored) {
        this.localVector = JSON.parse(stored);
      } else {
        // Seed default timestamps
        this.localVector = {
          '047': Date.now(),
          '001': Date.now() - 3600000
        };
        localStorage.setItem('kenya_gov_sync_vector', JSON.stringify(this.localVector));
      }
    } catch {
      this.localVector = {};
    }
  }

  /**
   * Initializes a WebRTC connection to a target peer.
   * In a real production deployment, the signalling offer/answer is exchanged via WebSockets,
   * but the underlying P2P data transmission is 100% direct WebRTC channel.
   */
  public async createOutgoingSyncOffer(): Promise<RTCSessionDescriptionInit> {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    this.peerConnection = new RTCPeerConnection(configuration);
    
    // Create the P2P Data Channel
    this.dataChannel = this.peerConnection.createDataChannel('governance_sync_channel', {
      ordered: true
    });

    this.setupDataChannelListeners();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  /**
   * Receives an incoming peer connection offer, sets up listeners,
   * and creates the WebRTC answer.
   */
  public async acceptIncomingSyncOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelListeners();
    };

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  /** Set up the WebRTC P2P Data Channel message listeners */
  private setupDataChannelListeners() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log(`📡 [P2P Sync] Data channel opened with remote peer.`);
      this.dispatchLocalVectorClock();
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message: SyncPayload = JSON.parse(event.data);
        this.handleIncomingP2PSyncMessage(message);
      } catch (err) {
        console.error('Failed to parse incoming P2P message', err);
      }
    };

    this.dataChannel.onclose = () => {
      console.log(`🔌 [P2P Sync] Data channel disconnected.`);
    };
  }

  /** Broadcast local timestamps vector so the remote peer can detect updates */
  private dispatchLocalVectorClock() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;

    const payload: SyncPayload = {
      type: 'STATE_HASH_VECTOR',
      senderPeerId: this.peerId,
      vector: this.localVector
    };

    this.dataChannel.send(JSON.stringify(payload));
  }

  /**
   * Evaluates the remote peer's Vector Clock against the local clock.
   * If the remote peer has newer updates, it requests the data.
   * If the local peer has newer updates, it pushes them automatically.
   */
  private handleIncomingP2PSyncMessage(msg: SyncPayload) {
    console.log(`📥 [P2P Sync] Received ${msg.type} from peer: ${msg.senderPeerId}`);

    if (msg.type === 'STATE_HASH_VECTOR') {
      const countiesToRequest: string[] = [];
      const countiesToPush: string[] = [];

      // Compare vectors
      const allCounties = new Set([...Object.keys(this.localVector), ...Object.keys(msg.vector)]);
      
      allCounties.forEach((code) => {
        const localTime = this.localVector[code] || 0;
        const remoteTime = msg.vector[code] || 0;

        if (remoteTime > localTime) {
          countiesToRequest.push(code);
        } else if (localTime > remoteTime) {
          countiesToPush.push(code);
        }
      });

      // 1. If we have newer updates, push them
      if (countiesToPush.length > 0) {
        this.pushNewerDataToRemotePeer(countiesToPush);
      }

      // 2. If they have newer updates, request them
      if (countiesToRequest.length > 0) {
        this.requestDataFromRemotePeer(countiesToRequest);
      }
    } else if (msg.type === 'SYNC_REQUEST') {
      const targetCounties = msg.payloadData as string[];
      this.pushNewerDataToRemotePeer(targetCounties);
    } else if (msg.type === 'SYNC_DATA') {
      const incomingUpdates = msg.payloadData as Record<string, { data: any; timestamp: number }>;
      this.mergeIncomingP2PUpdates(incomingUpdates);
    }
  }

  private requestDataFromRemotePeer(countyCodes: string[]) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;
    this.dataChannel.send(JSON.stringify({
      type: 'SYNC_REQUEST',
      senderPeerId: this.peerId,
      vector: this.localVector,
      payloadData: countyCodes
    }));
  }

  private pushNewerDataToRemotePeer(countyCodes: string[]) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;

    const dataPayload: Record<string, any> = {};
    countyCodes.forEach((code) => {
      // Fetch latest values from local storage
      const localData = localStorage.getItem(`kenya_county_data_${code}`);
      dataPayload[code] = {
        data: localData ? JSON.parse(localData) : { code, syncVerification: 'Vetted_P2P' },
        timestamp: this.localVector[code] || Date.now()
      };
    });

    this.dataChannel.send(JSON.stringify({
      type: 'SYNC_DATA',
      senderPeerId: this.peerId,
      vector: this.localVector,
      payloadData: dataPayload
    }));
  }

  private mergeIncomingP2PUpdates(updates: Record<string, { data: any; timestamp: number }>) {
    let clockModified = false;

    for (const [code, update] of Object.entries(updates)) {
      const localTime = this.localVector[code] || 0;
      if (update.timestamp > localTime) {
        localStorage.setItem(`kenya_county_data_${code}`, JSON.stringify(update.data));
        this.localVector[code] = update.timestamp;
        clockModified = true;
        console.log(`✨ [P2P Sync] Merged newer P2P update for County: ${code}`);
      }
    }

    if (clockModified) {
      localStorage.setItem('kenya_gov_sync_vector', JSON.stringify(this.localVector));
    }
  }
}
