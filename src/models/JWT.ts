export class JWTPayload {
  uuid: string
  validTo: Date

  constructor(uuid: string, exp: Date) {
    this.uuid = uuid
    this.validTo = exp
  }
}

export class RefreshPayload {
  uuid: string
  sequenceNumber: number
  exp: Date

  constructor(uuid: string, sequenceNumber: number, exp: Date) {
    this.uuid = uuid
    this.sequenceNumber = sequenceNumber
    this.exp = exp
  }
}