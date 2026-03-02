<script lang="ts">
	import '$lib/app.css';
	import { page } from '$app/state';
	import { 
		LayoutDashboard, 
		Users, 
		Package, 
		CalendarRange, 
		WalletCards, 
		BarChart3, 
		LogOut,
		Menu,
		X
	} from 'lucide-svelte';

	let { children } = $props();
	let isSidebarOpen = $state(false);

	const navigation = [
		{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Customers', href: '/customers', icon: Users },
		{ name: 'Products', href: '/products', icon: Package },
		{ name: 'Installments', href: '/installments', icon: CalendarRange },
		{ name: 'Payments', href: '/payments', icon: WalletCards },
		{ name: 'Reports', href: '/reports', icon: BarChart3 },
	];

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	const isLoginPage = $derived(page.url.pathname === '/login');
</script>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="min-h-screen bg-gray-50 flex font-sans">
		<!-- Mobile Sidebar Overlay (Only active if triggered) -->
		{#if isSidebarOpen}
			<div 
				role="button"
				tabindex="0"
				aria-label="Close sidebar"
				class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
				onclick={toggleSidebar}
				onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
			></div>
		{/if}

		<!-- Desktop Sidebar (Hidden on Mobile) -->
		<aside 
			class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 hidden lg:flex flex-col"
		>
			<div class="h-full flex flex-col">
				<div class="p-6 border-b border-gray-100">
					<div class="flex items-center gap-3">
						<div class="bg-gray-900 p-2.5 rounded-lg">
							<WalletCards class="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 class="text-lg font-bold text-gray-900 tracking-tight leading-none">Al-Farooq</h1>
							<p class="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-1">Installments</p>
						</div>
					</div>
				</div>

				<nav class="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
					{#each navigation as item}
						<a
							href={item.href}
							class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group {page.url.pathname.startsWith(item.href) 
								? 'bg-gray-100 text-gray-900' 
								: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
						>
							<item.icon class="w-5 h-5 {page.url.pathname.startsWith(item.href) ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}" />
							{item.name}
						</a>
					{/each}
				</nav>

				<div class="p-4 border-t border-gray-100 mt-auto">
					<form method="POST" action="/logout">
						<button
							class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
						>
							<LogOut class="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
							Sign Out
						</button>
					</form>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col lg:pl-64 pb-20 lg:pb-0"> <!-- Added pb-20 for mobile nav -->
			<!-- Top Header -->
			<header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
				<div class="flex items-center gap-3">
					<!-- App Name Header exclusively for Mobile -->
					<div class="lg:hidden flex items-center gap-2">
						<div class="bg-gray-900 p-1.5 rounded-md">
							<WalletCards class="w-4 h-4 text-white" />
						</div>
						<h1 class="text-sm font-bold text-gray-900 tracking-tight">Al-Farooq</h1>
					</div>

					<div class="hidden lg:flex flex-col">
						<h2 class="text-base font-semibold text-gray-900">
							{navigation.find(n => page.url.pathname.startsWith(n.href))?.name || 'Overview'}
						</h2>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<div class="hidden sm:flex flex-col items-end">
						<span class="text-sm font-medium text-gray-900 leading-none">{page.data.user?.name || 'Admin'}</span>
						<span class="text-[11px] font-medium text-gray-500 mt-1 uppercase tracking-wide">{page.data.user?.role || 'Staff'}</span>
					</div>
					<div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
						<Users class="w-4 h-4 text-gray-500" />
					</div>
					
					<!-- Small LogOut specific to Mobile Header -->
					<form method="POST" action="/logout" class="lg:hidden">
						<button class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full bg-gray-50">
							<LogOut class="w-4 h-4" />
						</button>
					</form>
				</div>
			</header>

			<main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
				{@render children()}
			</main>
		</div>

		<!-- Mobile Bottom Navigation (App-like) -->
		<nav class="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
			<div class="flex items-center justify-between px-2 sm:px-4 py-2">
				{#each navigation.slice(0, 5) as item} <!-- Limit to 5 items to fit well on mobile -->
					<a
						href={item.href}
						class="flex flex-col items-center justify-center w-full gap-1 p-1.5 rounded-xl transition-all {page.url.pathname.startsWith(item.href) ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'}"
					>
						<div class="relative p-1">
							<item.icon class="w-5 h-5 {page.url.pathname.startsWith(item.href) ? 'text-gray-900 stroke-[2.5px]' : ''}" />
							{#if page.url.pathname.startsWith(item.href)}
								<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
							{/if}
						</div>
						<span class="text-[9px] font-bold uppercase tracking-wider">{item.name}</span>
					</a>
				{/each}
			</div>
		</nav>
	</div>
{/if}

