const reservations = new Map();
const paymentRequests = new Map();
const DEFAULT_CAPACITY = 12;

export function reserveTuitionOffer({ enrolmentId, offer }) {
  const existing = reservations.get(enrolmentId);
  if (existing) return { ok: true, reservation: existing, idempotent: true };

  const reservedForOffer = [...reservations.values()].filter((entry) => entry.offerId === offer.id && entry.status === 'held').length;
  if (reservedForOffer >= DEFAULT_CAPACITY) return { ok: false, error: 'selected class is full' };

  const reservation = {
    id: `RSV-${enrolmentId}`,
    enrolmentId,
    offerId: offer.id,
    schedule: offer.schedule,
    status: 'held',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  reservations.set(enrolmentId, reservation);
  return { ok: true, reservation, idempotent: false };
}

export function createTuitionPaymentRequest({ enrolmentId, amount, billingType }) {
  const existing = paymentRequests.get(enrolmentId);
  if (existing) return { ok: true, paymentRequest: existing, idempotent: true };

  const baseUrl = process.env.PAYMENT_LINK_BASE_URL;
  if (!baseUrl) return { ok: false, error: 'payment provider is not configured' };

  const paymentRequest = {
    id: `PAY-${enrolmentId}`,
    enrolmentId,
    amount,
    currency: 'MYR',
    billingType,
    status: 'pending',
    url: `${baseUrl.replace(/\/$/, '')}/${encodeURIComponent(enrolmentId)}`,
  };
  paymentRequests.set(enrolmentId, paymentRequest);
  return { ok: true, paymentRequest, idempotent: false };
}

export function getTuitionPaymentRequest(enrolmentId) {
  return paymentRequests.get(enrolmentId) || null;
}

export function verifyTuitionPayment({ enrolmentId, reference, amount }) {
  const payment = paymentRequests.get(enrolmentId);
  if (!payment) return { ok: false, error: 'payment request not found' };
  if (!reference) return { ok: false, error: 'payment reference is required' };
  if (Number(amount) !== payment.amount) return { ok: false, error: 'payment amount does not match' };
  payment.status = 'paid';
  payment.reference = reference;
  payment.paidAt = new Date().toISOString();
  return { ok: true, paymentRequest: payment };
}
