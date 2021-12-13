import { format } from 'winston';
import traverse from 'traverse';

const captureKeys = ['email', 'province', 'eventId'];

const extractFields = format((info) => {
  const newFields: Record<string, any> = {};

  const result = traverse(info).map(function extract() {
    if (this.key && captureKeys.includes(this.key)) {
      newFields[this.key] = this.node;
    } else if (this.key === 'uuid' && this.parent?.key === 'event') {
      newFields.eventId = this.node;
    } else if (this.key === 'serialNumber' && this.parent?.key === 'device') {
      newFields.deviceSerialNumber = this.node;
    }
  });

  // There is a bug in traverse.map where symbols are not copied to the new object
  const levelSym = Symbol.for('level');
  const splatSym = Symbol.for('splat');

  result[levelSym] = info[levelSym as unknown as string];
  result[splatSym] = info[splatSym as unknown as string];

  const data = { ...result[0], ...newFields };

  result[0] = data;

  return result;
});

export default extractFields;
