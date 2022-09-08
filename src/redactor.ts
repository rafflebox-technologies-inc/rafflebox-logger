import { format } from 'winston';
import traverse from 'traverse';

const keysToRedact = [
  'client_secret',
  'newPassword',
  'currentPassword',
  'stripeSecretKey',
  'password',
  'description',
  'blurb',
  'rules',
  'authorization'
];

const redact = format(info => {
  const result = traverse(info).map(function redactor() {
    if (this.key && keysToRedact.includes(this.key)) {
      this.update('[REDACTED]');
    }
  });

  // There is a bug in traverse.map where symbols are not copied to the new object
  const levelSym = Symbol.for('level');
  const splatSym = Symbol.for('splat');

  result[levelSym] = info[(levelSym as unknown) as string];
  result[splatSym] = info[(splatSym as unknown) as string];

  return result;
});

export default redact;
