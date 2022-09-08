import { format } from 'winston';
import traverse from 'traverse';

let keysToRedact = [
  'client_secret',
  'newPassword',
  'currentPassword',
  'stripeSecretKey',
  'password',
  'description',
  'blurb',
  'rules',
  'Authorization'
];

// makes it case insensitive
keysToRedact = keysToRedact.map(key => key.toLowerCase());

const redact = format(info => {
  const result = traverse(info).map(function redactor() {
    if (this.key && keysToRedact.includes(this.key.toLowerCase())) {
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
