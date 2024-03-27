import { Document, Schema } from 'mongoose';

// TypeScript interface for UserAccess
export interface IUserAccess extends Document {
  userUUID: string;
  accessLevel: string;
}

// Sub-schema for user access
export const UserAccessSchema: Schema<IUserAccess> = new Schema({
  userUUID: {
    type: String,
    required: [true, 'User UUID is required.'],
    validate: {
      validator: function(uuid: string) {
        return /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(uuid);
      },
      message: props => `${props.value} is not a valid UUID!`
    },
    length: [36, 'User UUID must be 36 characters long.']
  },
  accessLevel: {
    type: String,
    enum: ['read', 'write', 'owner'],
    required: [true, 'Access type is required.']
  },
});