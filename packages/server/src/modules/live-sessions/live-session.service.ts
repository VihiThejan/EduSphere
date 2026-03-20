import { LiveSessionModel, ILiveSession } from './live-session.model.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../../shared/utils/errors.js';

// ── Jitsi Meet — 100% free, no account, no API key, no credit card ────────────
// Rooms are created on-demand simply by visiting https://meet.jit.si/<roomName>
const JITSI_HOST = 'https://meet.jit.si';

function generateRoomName(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `EduSphere-${Date.now()}-${rand}`;
}

// ── service ───────────────────────────────────────────────────────────────────
export class LiveSessionService {
  /** Generate a Jitsi room URL and store the session in MongoDB. No external API call needed. */
  async createSession(
    hostId: string,
    title: string,
    options: {
      description?: string;
      courseId?: string;
      scheduledAt?: Date;
      maxParticipants?: number;
    } = {}
  ): Promise<ILiveSession> {
    const roomName = generateRoomName();
    const roomUrl = `${JITSI_HOST}/${roomName}`;

    const session = await LiveSessionModel.create({
      title,
      description: options.description,
      courseId: options.courseId,
      hostId,
      roomName,
      roomUrl,
      status: 'scheduled',
      scheduledAt: options.scheduledAt,
      maxParticipants: options.maxParticipants ?? 100,
    });

    return session;
  }

  /** Return the session for the requesting user and mark it live when the host joins. */
  async joinSession(
    sessionId: string,
    userId: string,
    isHost: boolean
  ): Promise<{ session: ILiveSession; token: string }> {
    const session = await LiveSessionModel.findById(sessionId);
    if (!session) throw new NotFoundError('Live session');
    if (session.status === 'ended') throw new ValidationError('This session has already ended.');

    const isActualHost = session.hostId.toString() === userId;

    // Prevent anyone except the actual host from joining as host
    if (isHost && !isActualHost) {
      throw new AuthorizationError('Only the session host can join as host.');
    }

    // Students can only enter once the session is live
    if (!isHost && session.status === 'scheduled') {
      throw new ValidationError('This session has not started yet. Wait for the tutor to begin.');
    }

    // Mark as live on host first join
    if (isHost && session.status === 'scheduled') {
      session.status = 'live';
      session.startedAt = new Date();
      await session.save();
    }

    return { session, token: '' };
  }

  async endSession(sessionId: string, hostId: string): Promise<ILiveSession> {
    const session = await LiveSessionModel.findById(sessionId);
    if (!session) throw new NotFoundError('Live session');
    if (session.hostId.toString() !== hostId) {
      throw new AuthorizationError('Only the host can end this session.');
    }

    // Jitsi rooms auto-close when everyone leaves; just update DB status
    session.status = 'ended';
    session.endedAt = new Date();
    await session.save();
    return session;
  }

  async getSessionsByHost(hostId: string): Promise<ILiveSession[]> {
    return LiveSessionModel.find({ hostId }).sort({ createdAt: -1 });
  }

  async getSessionsByCourse(courseId: string): Promise<ILiveSession[]> {
    return LiveSessionModel.find({ courseId, status: { $ne: 'ended' } }).sort({ scheduledAt: 1 });
  }

  async getAllActiveSessions(): Promise<ILiveSession[]> {
    return LiveSessionModel.find({ status: { $in: ['scheduled', 'live'] } })
      .populate('hostId', 'profile.firstName profile.lastName profile.avatar email')
      .sort({ status: -1, scheduledAt: 1 }); // live sessions first
  }
}

export const liveSessionService = new LiveSessionService();
