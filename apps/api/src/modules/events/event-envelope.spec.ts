import {
  EVENT_SCHEMA_VERSION,
  buildEventEnvelope,
  generateEventId,
} from './event-envelope';

describe('EventEnvelope (D-4)', () => {
  it('stamps eventId, schemaVersion, emittedAt and tenantId on every envelope', () => {
    const envelope = buildEventEnvelope('tenant-1');

    expect(envelope.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(envelope.schemaVersion).toBe(EVENT_SCHEMA_VERSION);
    expect(envelope.emittedAt).toEqual(expect.any(String));
    expect(envelope.tenantId).toBe('tenant-1');
    expect(envelope.causationId).toBeNull();
  });

  it('generates distinct event ids', () => {
    expect(generateEventId()).not.toBe(generateEventId());
  });

  it('supports a caller-supplied stable eventId (redelivery)', () => {
    const eventId = generateEventId();
    expect(buildEventEnvelope('t', { eventId }).eventId).toBe(eventId);
  });

  it('records the causation chain linkage', () => {
    const root = buildEventEnvelope('t');
    const child = buildEventEnvelope('t', { causationId: root.eventId });

    expect(child.eventId).not.toBe(root.eventId);
    expect(child.causationId).toBe(root.eventId);
  });
});