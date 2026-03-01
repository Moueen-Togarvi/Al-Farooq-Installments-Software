import { prisma } from '$lib/server/prisma';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    try {
        const sessionId = event.cookies.get('session');

        if (!sessionId) {
            event.locals.user = null;
        } else {
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
        }

        // Protect routes (all routes except /login)
        if (!event.locals.user && !event.url.pathname.startsWith('/login')) {
            return new Response(null, {
                status: 303,
                headers: { location: '/login' }
            });
        }

        return resolve(event);
    } catch (err: any) {
        // Re-throw SvelteKit redirects and failures
        if (err.status && (err.location || err.data)) throw err;

        console.error('HOOK ERROR:');
        console.dir(err, { depth: null });
        throw err;
    }
};
