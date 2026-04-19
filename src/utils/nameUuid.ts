import md5 from 'md5';

/**
 * Java {@code UUID.nameUUIDFromBytes(byte[])} 와 동일한 type-3 (MD5) 이름 기반 UUID.
 * Career 시드 키는 {@code ROLE:키워드} 형태(태그는 {@code CareerTag} enum 이름).
 */
export function nameUuidFromUtf8String(input: string): string {
  const digestbytes = md5(input, { asBytes: true }) as number[];
  digestbytes[6] = (digestbytes[6]! & 0x0f) | 0x30;
  digestbytes[8] = (digestbytes[8]! & 0x3f) | 0x80;
  const hex = digestbytes.map((b) => (b & 0xff).toString(16).padStart(2, '0')).join('');
  return (
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  );
}
