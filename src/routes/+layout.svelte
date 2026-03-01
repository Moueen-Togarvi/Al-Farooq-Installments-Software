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
	<div class="min-h-screen bg-slate-50 flex">
		<!-- Mobile Sidebar Overlay -->
		{#if isSidebarOpen}
			<div 
				role="button"
				tabindex="0"
				aria-label="Close sidebar"
				class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
				onclick={toggleSidebar}
				onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
			></div>
		{/if}

		<!-- Sidebar -->
		<aside 
			class="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0 {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
		>
			<div class="h-full flex flex-col">
				<div class="p-6 border-b border-slate-50">
					<div class="flex items-center gap-3">
						<div class="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-md">
							<WalletCards class="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 class="text-xl font-bold text-slate-800 tracking-tight leading-none">Al-Farooq</h1>
							<p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Installments</p>
						</div>
					</div>
				</div>

				<nav class="flex-1 p-4 space-y-1.5 overflow-y-auto mt-2">
					{#each navigation as item}
						<a
							href={item.href}
							class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all group {page.url.pathname.startsWith(item.href) 
								? 'bg-blue-50 text-blue-600 shadow-sm' 
								: 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}"
						>
							<item.icon class="w-[18px] h-[18px] {page.url.pathname.startsWith(item.href) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}" />
							{item.name}
						</a>
					{/each}
				</nav>

				<div class="p-4 border-t border-slate-50 mt-auto">
					<form method="POST" action="/logout">
						<button
							class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-all group"
						>
							<LogOut class="w-[18px] h-[18px] text-slate-400 group-hover:text-red-600" />
							Sign Out
						</button>
					</form>
				</div>
			</div>
		</aside>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col lg:pl-72">
			<!-- Top Header -->
			<header class="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
				<button 
					class="lg:hidden p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
					onclick={toggleSidebar}
					aria-label="Toggle sidebar"
				>
					<Menu class="w-6 h-6" />
				</button>

				<div class="hidden lg:flex flex-col">
					<h2 class="text-lg font-bold text-slate-800">
						{navigation.find(n => page.url.pathname.startsWith(n.href))?.name || 'Dashboard'}
					</h2>
					<p class="text-xs text-slate-400 font-medium">Welcome back, {page.data.user?.name || 'Admin'}</p>
				</div>

				<div class="flex items-center gap-4">
					<div class="hidden sm:block text-right">
						<p class="text-sm font-bold text-slate-800 leading-tight">{page.data.user?.name || 'Admin'}</p>
						<p class="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{page.data.user?.role || 'Staff'}</p>
					</div>
					<div class="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
						<Users class="w-6 h-6 text-slate-400" />
					</div>
				</div>
			</header>

			<main class="flex-1 p-6 md:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
