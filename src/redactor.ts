import { format } from 'winston';
import traverse from 'traverse';

// any values you enter here should be lowercase for it to work - it will redact regardless of case sensitivity
const keysToRedact = [
  'client_secret',
  'newpassword',
  'currentpassword',
  'stripesecretkey',
  'password',
  'description',
  'blurb',
  'rules',
  'authorization',
];

const redact = format((info) => {
  const result = traverse(info).map(function redactor() {
    // the toString() is due to the fact that the key can be a symbol even though typing right now assumes it is a string
    if (this.key && keysToRedact.includes(this.key.toString().toLowerCase())) {
      this.update('[REDACTED]');
    }
  });

  // There is a bug in traverse.map where symbols are not copied to the new object
  const levelSym = Symbol.for('level');
  const splatSym = Symbol.for('splat');

  result[levelSym] = info[levelSym as unknown as string];
  result[splatSym] = info[splatSym as unknown as string];

  return result;
});

export default redact;
