// Recursively remove null, undefined, 0, empty string, empty array, and empty object values from an object
export function cleanObject<T>(obj: T): T {
  if (Array.isArray(obj)) {
    // Clean each item and filter out empty results
    return obj
      .map(cleanObject)
      .filter(
        (v) =>
          v !== null &&
          v !== undefined &&
          v !== '' &&
          !(Array.isArray(v) && v.length === 0) &&
          !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) &&
          v !== 0
      ) as any;
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj instanceof Map) {
      // Clean Map values, but preserve Map structure
      const cleanedEntries = Array.from(obj.entries())
        .map(([k, v]) => [k, cleanObject(v)] as [unknown, unknown])
        .filter(
          ([, v]) =>
            v !== null &&
            v !== undefined &&
            v !== '' &&
            !(Array.isArray(v) && v.length === 0) &&
            !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) &&
            v !== 0
        );
      return new Map(cleanedEntries) as any;
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleaned = cleanObject(value);
      if (
        cleaned !== null &&
        cleaned !== undefined &&
        cleaned !== '' &&
        !(Array.isArray(cleaned) && cleaned.length === 0) &&
        !(
          typeof cleaned === 'object' &&
          !Array.isArray(cleaned) &&
          Object.keys(cleaned).length === 0
        ) &&
        cleaned !== 0
      ) {
        result[key] = cleaned;
      }
    }
    return result;
  }
  return obj;
}
