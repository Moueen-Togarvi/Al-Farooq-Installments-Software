<script lang="ts">
	import { 
		Users, 
		AlertTriangle, 
		Calendar, 
		DollarSign,
		CheckCircle2,
		ShieldCheck,
		PiggyBank
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
		{ name: 'Investment Balance', value: formatCurrency(data.stats.investmentBalance), icon: PiggyBank },
		{ name: `Collected (${data.selectedMonthLabel})`, value: formatCurrency(data.stats.totalCollectedThisMonth), icon: DollarSign },
		{ name: 'Pending Balance', value: formatCurrency(data.stats.totalPending), icon: AlertTriangle },
	]);
</script>

<div class="space-y-8">
	{#if data.dbError}
		<div class="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-center gap-3 text-yellow-800">
			<AlertTriangle class="w-5 h-5 shrink-0" />
			<div class="flex-1">
				<p class="text-sm font-black uppercase tracking-tight">Database Connectivity Note</p>
				<p class="text-xs font-bold opacity-75">{data.dbError}</p>
			</div>
			<button onclick={() => window.location.reload()} class="px-4 py-2 bg-yellow-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-700 transition-colors shadow-sm">
				Refresh Now
			</button>
		</div>
	{/if}

	<div class="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
		<form method="GET" class="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4">
			<div class="flex-1">
				<p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Collection Month Filter</p>
				<p class="text-xs font-bold text-gray-500 mt-1">Showing monthly collection for {data.selectedMonthLabel}</p>
			</div>
			<div class="flex flex-col sm:flex-row sm:items-center gap-2">
				<input
					type="month"
					name="month"
					value={data.selectedMonth}
					onchange={(event) => (event.currentTarget as HTMLInputElement).form?.requestSubmit()}
					class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				/>
				<button
					type="submit"
					class="px-4 py-2.5 rounded-lg bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
				>
					Apply
				</button>
				<a
					href="/dashboard"
					class="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors text-center"
				>
					Current
				</a>
			</div>
		</form>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-6">
		{#each statsCards as stat}
			{@const Icon = stat.icon}
			<div class="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group">
				<div class="flex items-center justify-between">
					<p class="text-[9px] sm:text-xs font-black text-gray-400 sm:text-gray-500 uppercase tracking-widest leading-tight">{stat.name}</p>
					<div class="bg-gray-100 p-1.5 sm:p-2 rounded-lg group-hover:bg-black transition-colors shrink-0 ml-2">
						<Icon class="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 group-hover:text-white" />
					</div>
				</div>
				<div class="mt-4 sm:mt-5">
					<p class="text-xl sm:text-3xl font-black text-black tracking-tight">{stat.value}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Due Today Section -->
		<div class="bg-white rounded-xl shadow-sm border-2 border-gray-200 flex flex-col overflow-hidden">
			<div class="px-6 py-5 border-b-2 border-gray-100 flex items-center justify-between bg-gray-50">
				<h3 class="text-base font-black text-black flex items-center gap-2 uppercase tracking-wide">
					<Calendar class="w-5 h-5 text-black" />
					Installments Due Today
				</h3>
				{#if data.todayDue.length > 0}
					<span class="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-widest uppercase">
						{data.todayDue.filter((i: any) => i.status !== 'PAID').length} REMAINING
					</span>
				{/if}
			</div>
			
			<div class="flex-1 divide-y-2 divide-gray-100">
				{#each data.todayDue as item}
					<div class="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group {item.status === 'PAID' ? 'opacity-75' : ''}">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-sm font-black text-black shrink-0">
								{item.plan?.customer?.name ? item.plan.customer.name.substring(0, 2).toUpperCase() : 'NA'}
							</div>
							<div>
								<p class="text-sm font-black text-black">{item.plan?.customer?.name || 'Unknown'}</p>
								<div class="flex items-center gap-2 mt-0.5">
									<p class="text-xs font-bold text-gray-500">{item.plan?.product?.name || 'Unknown'}</p>
									{#if item.status === 'PAID'}
										<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-[8px] font-black text-emerald-700 uppercase tracking-tighter">
											<CheckCircle2 class="w-2.5 h-2.5" /> PAID
										</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="text-right flex flex-col items-end">
							<p class="text-sm font-black text-black {item.status === 'PAID' ? 'line-through text-gray-400' : ''}">{formatCurrency(item.amount)}</p>
							<a 
								href="/installments/{item.plan?.id}" 
								class="px-3 py-1 bg-gray-100 text-[10px] font-black text-black hover:bg-black hover:text-white transition-colors mt-2 text-center rounded inline-block uppercase tracking-wider"
							>
								{item.status === 'PAID' ? 'View Ledger' : 'Take Payment'}
							</a>
						</div>
					</div>
				{:else}
					<div class="py-16 flex flex-col items-center justify-center text-center px-6">
						<CheckCircle2 class="w-10 h-10 text-gray-300 mb-3" />
						<p class="text-sm font-black text-black uppercase tracking-wide">All Caught Up</p>
						<p class="text-xs font-bold text-gray-500 mt-1">No installments are due for collection today.</p>
					</div>
				{/each}
			</div>
			
			{#if data.todayDue.length > 0}
				<div class="px-6 py-4 border-t-2 border-gray-100 bg-gray-50 text-center">
					<button class="text-xs font-black text-gray-500 hover:text-black transition-colors uppercase tracking-widest">
						Print Collection Sheet
					</button>
				</div>
			{/if}
		</div>

		<!-- Overdue List -->
		<div class="bg-white rounded-xl shadow-sm border-2 border-red-200 flex flex-col overflow-hidden">
			<div class="px-6 py-5 border-b-2 border-red-100 bg-red-50/50">
				<h3 class="text-base font-black text-red-600 flex items-center gap-2 uppercase tracking-wide">
					<AlertTriangle class="w-5 h-5" />
					Critical Overdue
				</h3>
			</div>

			<div class="flex-1 divide-y-2 divide-red-50">
				{#each data.overdueInstallments as item}
					<div class="px-6 py-4 hover:bg-red-50 transition-colors flex items-center justify-between group">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 rounded-full bg-white border border-red-200 flex items-center justify-center text-sm font-black text-red-600 shrink-0">
								{item.plan?.customer?.name ? item.plan.customer.name.substring(0, 2).toUpperCase() : 'NA'}
							</div>
							<div>
								<p class="text-sm font-black text-black">{item.plan?.customer?.name || 'Unknown'}</p>
								<p class="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-widest">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
							</div>
						</div>
						<div class="text-right flex flex-col items-end">
							<p class="text-sm font-black text-red-600">{formatCurrency(item.pendingAmount)}</p>
							<a 
								href="/installments/{item.plan?.id}" 
								class="px-3 py-1 bg-red-100 text-[10px] font-black text-red-700 hover:bg-red-600 hover:text-white transition-colors mt-2 text-center rounded inline-block uppercase tracking-wider"
							>
								Action Needed
							</a>
						</div>
					</div>
				{:else}
					<div class="py-16 flex flex-col items-center justify-center text-center px-6">
						<ShieldCheck class="w-10 h-10 text-emerald-200 mb-3" />
						<p class="text-sm font-black text-black uppercase tracking-wide">Excellent Recovery Rate</p>
						<p class="text-xs font-bold text-gray-500 mt-1">There are currently no overdue installments.</p>
					</div>
				{/each}
			</div>

			{#if data.overdueInstallments.length > 0}
				<div class="px-6 py-4 border-t-2 border-red-100 bg-red-50/50 text-center">
					<a href="/reports?type=defaulters" class="text-xs font-black text-red-600 hover:text-red-800 transition-colors uppercase tracking-widest">
						View All Defaulters
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
