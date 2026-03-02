import { prisma } from '$lib/server/prisma';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    try {
        const sessionId = event.cookies.get('session');

        if (!sessionId) {
            event.locals.user = null;
        } else {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: sessionId },
                    select: { id: true, email: true, name: true, role: true }
                });

                if (user) {
                    event.locals.user = user;
                } else {
                    event.locals.user = null;
                    event.cookies.delete('session', { path: '/' });
                }
            } catch (dbErr) {
                console.error('DATABASE CONNECTIVITY ERROR IN HOOKS:', dbErr);
                // If DB is down, we can't verify session, treat as null user
                event.locals.user = null;
            }
        }

        // Protect routes (all routes except /login)
        if (!event.locals.user && !event.url.pathname.startsWith('/login')) {
            return new Response(null, {
                status: 303,
                headers: { location: '/login' }
            });
        }

        const response = await resolve(event);

        // Security / Bug Bounty Headers
        response.headers.set('X-Frame-Options', 'DENY'); // Prevent clickjacking
        response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME-sniffing
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'); // Enforce HTTPS
        response.headers.set('X-XSS-Protection', '1; mode=block'); // Legacy XSS Protection (SvelteKit escapes by default)

        return response;
    } catch (err: any) {
        // Re-throw SvelteKit redirects and failures
        if (err.status && (err.location || err.data)) throw err;

        console.error('HOOK ERROR:');
        console.dir(err, { depth: null });
        throw err;
    }
};
