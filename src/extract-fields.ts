import { format } from 'winston';
import traverse from 'traverse';

const captureKeys = ['email', 'province', 'client', 'rb-client', 'locale', 'phone', 'eventId'];

/**
 * For email, we grab the email from the first node/object.
 * And if we find another instance and it's already set then ignore it.
 */
const extractFields = format(info => {
  const newFields: Record<string, any> = {};

  const result = traverse(info).map(function extract() {
    if (this.key && captureKeys.includes(this.key)) {
      if (this.key === 'email' && newFields.email !== undefined) {
        return;
      } else {
        newFields[this.key] = this.node;
      }

      return;
    }

    if (this.key === 'uuid' && this.parent?.key === 'event') {
      newFields.eventId = this.node;
    } else if (this.key === 'serialNumber' || this.key === 'deviceSerialNumber') {
      newFields.deviceSerialNumber = this.node;

      return;
    }

    // province
    if (this.key === 'state' || this.key === 'provinceState') {
      newFields.province = this.node;

      return;
    }

    // event
    if (this.parent?.key === 'event') {
      if (this.key === 'id' && Number(this.node)) {
        newFields.eventNumber = this.node;
      } else if ((this.key === 'id' || this.key === 'uuid') && typeof this.node === 'string') {
        newFields.eventId = this.node;
      }

      return;
    }

    // order
    if (this.parent?.key === 'order') {
      if (this.key === 'id' && Number(this.node)) {
        newFields.orderNumber = this.node;
      } else if ((this.key === 'id' || this.key === 'uuid') && typeof this.node === 'string') {
        newFields.orderId = this.node;
      } else if (this.key === 'referenceId') {
        newFields.orderReferenceId = this.node;
      }

      return;
    }

    // organization
    if (this.parent?.key === 'organization') {
      if (this.key === 'id' && Number(this.node)) {
        newFields.organizationNumber = this.node;
      } else if ((this.key === 'id' || this.key === 'uuid') && typeof this.node === 'string') {
        newFields.organizationId = this.node;
      }
    }
  });

  // There is a bug in traverse.map where symbols are not copied to the new object
  const levelSym = Symbol.for('level');
  const splatSym = Symbol.for('splat');

  result[levelSym] = info[(levelSym as unknown) as string];
  result[splatSym] = info[(splatSym as unknown) as string];

  const data = { ...result[0], ...newFields };

  result[0] = data;

  return result;
});

export default extractFields;
