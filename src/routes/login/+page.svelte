<script lang="ts">
	import { enhance } from '$app/forms';
	import { Lock, User } from 'lucide-svelte';

	let { form } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
	<div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
		<div class="p-8">
			<div class="flex justify-center mb-6">
				<div class="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
					<Lock class="w-8 h-8 text-white" />
				</div>
			</div>
			
			<h2 class="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
			<p class="text-center text-slate-500 mb-8 font-medium">Al-Farooq Installments Software</p>
			
			<form method="POST" use:enhance class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-semibold text-slate-700 mb-2 mt-0">Email Address</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<User class="h-5 w-5 text-slate-400" />
						</div>
						<input
							type="email"
							name="email"
							id="email"
							required
							class="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800"
							placeholder="admin@example.com"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-semibold text-slate-700 mb-2 mt-0">Password</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<Lock class="h-5 w-5 text-slate-400" />
						</div>
						<input
							type="password"
							name="password"
							id="password"
							required
							class="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-800"
							placeholder="••••••••"
						/>
					</div>
				</div>

				{#if form?.error}
					<div class="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 italic">
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-2 mb-0"
				>
					Sign In
				</button>
			</form>
		</div>
		
		<div class="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
			<p class="text-xs text-slate-400 font-medium">
				Secure Login &copy; {new Date().getFullYear()} Al-Farooq
			</p>
		</div>
	</div>
</div>
