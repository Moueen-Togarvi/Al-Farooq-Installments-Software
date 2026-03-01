<script lang="ts">
	import { 
		Users, 
		TrendingUp, 
		AlertTriangle, 
		Calendar, 
		DollarSign,
		ArrowUpRight,
		ArrowDownRight,
		CheckCircle2,
		ShieldCheck,
		ArrowRight
	} from 'lucide-svelte';

	let { data } = $props();

	function formatCurrency(amount: any) {
		return new Intl.NumberFormat('en-PK', { 
			style: 'currency', 
			currency: 'PKR', 
			minimumFractionDigits: 0 
		}).format(parseFloat(amount?.toString() || '0'));
	}

	const statsCards = $derived([
		{ name: 'Total Customers', value: data.stats.totalCustomers, icon: Users },
		{ name: 'Active Plans', value: data.stats.activePlans, icon: ShieldCheck },
		{ name: 'Total Collected', value: formatCurrency(data.stats.totalReceived), icon: DollarSign },
		{ name: 'Pending Balance', value: formatCurrency(data.stats.totalPending), icon: AlertTriangle },
	]);
</script>

<div class="space-y-8">
	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
		{#each statsCards as stat}
			<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group">
				<div class="flex items-center justify-between">
					<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</p>
					<div class="bg-gray-50 p-2 rounded-lg group-hover:bg-gray-100 transition-colors">
						<stat.icon class="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
					</div>
				</div>
				<div class="mt-4">
					<p class="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Due Today Section -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
				<h3 class="text-base font-semibold text-gray-900 flex items-center gap-2">
					<Calendar class="w-5 h-5 text-gray-500" />
					Installments Due Today
				</h3>
				{#if data.todayDue.length > 0}
					<span class="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-md">
						{data.todayDue.length} PENDING
					</span>
				{/if}
			</div>
			
			<div class="flex-1 divide-y divide-gray-100">
				{#each data.todayDue as item}
					<div class="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
								{item.plan.customer.name.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<p class="text-sm font-semibold text-gray-900">{item.plan.customer.name}</p>
								<p class="text-xs text-gray-500 mt-0.5">{item.plan.product.name}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</p>
							<a 
								href="/installments/{item.plan.id}" 
								class="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors mt-0.5 inline-block"
							>
								View Ledger &rarr;
							</a>
						</div>
					</div>
				{:else}
					<div class="py-16 flex flex-col items-center justify-center text-center px-6">
						<CheckCircle2 class="w-8 h-8 text-gray-300 mb-3" />
						<p class="text-sm font-medium text-gray-900">All Caught Up</p>
						<p class="text-xs text-gray-500 mt-1">No installments are due for collection today.</p>
					</div>
				{/each}
			</div>
			
			{#if data.todayDue.length > 0}
				<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 text-center rounded-b-xl">
					<button class="text-sm font-medium text-gray-900 hover:text-black transition-colors">
						Print Collection Sheet
					</button>
				</div>
			{/if}
		</div>

		<!-- Overdue List -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
			<div class="px-6 py-5 border-b border-gray-200">
				<h3 class="text-base font-semibold text-red-600 flex items-center gap-2">
					<AlertTriangle class="w-5 h-5" />
					Critical Overdue
				</h3>
			</div>

			<div class="flex-1 divide-y divide-gray-100">
				{#each data.overdueInstallments as item}
					<div class="px-6 py-4 hover:bg-red-50/50 transition-colors flex items-center justify-between group">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-sm font-bold text-red-600 shrink-0">
								{item.plan.customer.name.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<p class="text-sm font-semibold text-gray-900">{item.plan.customer.name}</p>
								<p class="text-xs text-red-600 mt-0.5">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm font-bold text-red-600">{formatCurrency(item.pendingAmount)}</p>
							<a 
								href="/installments/{item.plan.id}" 
								class="text-xs font-medium text-red-600 hover:text-red-800 transition-colors mt-0.5 inline-block"
							>
								Action Needed &rarr;
							</a>
						</div>
					</div>
				{:else}
					<div class="py-16 flex flex-col items-center justify-center text-center px-6">
						<ShieldCheck class="w-8 h-8 text-gray-300 mb-3" />
						<p class="text-sm font-medium text-gray-900">Excellent Recovery Rate</p>
						<p class="text-xs text-gray-500 mt-1">There are currently no overdue installments.</p>
					</div>
				{/each}
			</div>

			{#if data.overdueInstallments.length > 0}
				<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 text-center rounded-b-xl">
					<a href="/reports?type=defaulters" class="text-sm font-medium text-gray-900 hover:text-black transition-colors">
						View All Defaulters
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
