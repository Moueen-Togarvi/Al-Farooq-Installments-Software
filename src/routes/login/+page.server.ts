import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
    // If already logged in, redirect to dashboard
    if (locals.user) {
        throw redirect(303, '/dashboard');
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!email || !password) {
            return fail(400, { error: 'Email and password are required' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return fail(400, { error: 'Invalid email or password' });
            }

            // In a real app, use bcrypt.compare here
            // For now, doing a simple check (we should hash passwords!)
            if (user.password !== password) {
                return fail(400, { error: 'Invalid email or password' });
            }

            // Create a simple session cookie
            cookies.set('session', user.id, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: !dev,
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            throw redirect(303, '/dashboard');
        } catch (err: any) {
            // Re-throw SvelteKit redirects and failures
            if (err.status && (err.location || err.data)) throw err;

            console.error('LOGIN ERROR:');
            console.dir(err, { depth: null });
            return fail(500, { error: 'Internal server error' });
        }
    }
};
