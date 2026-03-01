/**
 * Recursively converts Prisma Decimal objects to plain numbers for SvelteKit serialization.
 * SvelteKit's default data serializer can struggle with custom objects like Prisma.Decimal.
 */
export function serializeDecimals(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    // Preserve Date objects as SvelteKit handles them natively
    if (obj instanceof Date) return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(serializeDecimals);
    }

    // Handle Prisma Decimal specifically (duck typing for robustness)
    if (typeof obj === 'object' && (
        (obj.constructor && obj.constructor.name === 'Decimal') ||
        (typeof obj.toNumber === 'function') ||
        (obj.d && obj.e && obj.s) // Internal structure of decimal.js
    )) {
        return Number(obj);
    }

    // Handle regular objects and recurse
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = serializeDecimals(obj[key]);
        }
        return result;
    }

    return obj;
}
