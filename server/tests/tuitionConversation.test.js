import test from 'node:test';
import assert from 'node:assert/strict';
import { handleInboundMessage } from '../assistant/conversationEngine.js';
import { isConfirmation, matchName } from '../assistant/tuitionIntake.js';
import { verifyWorkflowPayment } from '../workflow.js';

function converse(phone, messages) {
  let result;
  for (const text of messages) result = handleInboundMessage({ industry: 'tuition', phone, text });
  return result;
}

test('negative confirmation text never confirms an enrolment', () => {
  assert.equal(isConfirmation('please do not confirm'), false);
  const result = converse('+60180001001', [
    'I need SPM add math and want to pay per class',
    'Nicole',
    'Aiman',
    '1',
    'please do not confirm',
  ]);
  assert.equal(result.item.stage, 'cancelled');
  assert.equal(result.item.needsAttention, false);
});

test('single-letter and placeholder names cannot advance intake', () => {
  assert.equal(matchName('a'), null);
  assert.equal(matchName('test'), null);

  const phone = '+60180001004';
  const started = converse(phone, ['hello']);
  const rejected = converse(phone, ['a']);
  assert.equal(rejected.item.id, started.item.id);
  assert.equal(rejected.item.missingField, 'guardianName');
  assert.equal(rejected.item.retryCount, 1);
  assert.match(rejected.reply, /at least two characters/i);
});

test('monthly enrolment keeps monthly price and conversation identity', () => {
  delete process.env.PAYMENT_LINK_BASE_URL;
  const phone = '+60180001002';
  const confirmed = converse(phone, [
    'I need SPM add math monthly',
    'Nicole',
    'Aiman',
    '1',
    'CONFIRM',
  ]);
  assert.equal(confirmed.item.billingType, 'monthly');
  assert.equal(confirmed.item.amount, 480);
  assert.equal(confirmed.item.stage, 'slot_reserved');
  assert.match(confirmed.reply, /RM480\/month/);
  assert.doesNotMatch(confirmed.reply, /payment link:/i);

  const followUp = converse(phone, ['When is the class?']);
  assert.equal(followUp.item.id, confirmed.item.id);
  assert.equal(followUp.isNewConversation, false);
});

test('legacy WhatsApp workflow items are hydrated before use', () => {
  assert.doesNotThrow(() => converse('+60 12-334 5567', ['hello']));
});

test('payment verification requires a matching amount', () => {
  process.env.PAYMENT_LINK_BASE_URL = 'https://payments.example.test/checkout';
  const result = converse('+60180001003', [
    'I need SPM add math and want to pay per class',
    'Nicole',
    'Aiman',
    '1',
    'CONFIRM',
  ]);
  assert.equal(result.item.stage, 'payment_pending');
  assert.equal(result.item.amount, 60);
  assert.ok(result.item.paymentRequest.url);
  assert.equal(verifyWorkflowPayment('tuition', result.item.id, { reference: 'BANK-1', amount: 59 }).error, 'payment amount does not match');
  assert.equal(verifyWorkflowPayment('tuition', result.item.id, { reference: 'BANK-1', amount: 60 }).item.stage, 'enrolled');
  delete process.env.PAYMENT_LINK_BASE_URL;
});
