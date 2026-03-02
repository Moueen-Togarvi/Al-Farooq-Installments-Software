import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { compare } from 'bcryptjs';

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
        const email = data.get('email')?.toString().trim();
        const password = data.get('password')?.toString();

        if (!email || !password) {
            return fail(400, { error: 'Email and password are required' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                console.warn(`Login attempt failed: User not found for email ${email}`);
                return fail(400, { error: 'Invalid email or password' });
            }

            // Verify password using bcrypt
            const isValid = await compare(password, user.password);

            if (!isValid) {
                console.warn(`Login attempt failed: Invalid password for email ${email}`);
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

            console.log(`User logged in successfully: ${email}`);
            throw redirect(303, '/dashboard');
        } catch (err: any) {
            // Re-throw SvelteKit redirects and failures
            if (err.status && (err.location || err.data)) throw err;

            console.error('CRITICAL LOGIN ERROR:', err);
            return fail(500, { error: 'Internal server error or database unreachable' });
        }
    }
};
