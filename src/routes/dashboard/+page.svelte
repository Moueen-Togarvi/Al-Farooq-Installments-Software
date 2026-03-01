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
		{ name: 'Total Customers', value: data.stats.totalCustomers, icon: Users, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
		{ name: 'Active Plans', value: data.stats.activePlans, icon: ShieldCheck, color: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
		{ name: 'Total Collected', value: formatCurrency(data.stats.totalReceived), icon: DollarSign, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
		{ name: 'Pending Balance', value: formatCurrency(data.stats.totalPending), icon: AlertTriangle, color: 'bg-amber-600', shadow: 'shadow-amber-200' },
	]);
</script>

<div class="space-y-10">
	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
		{#each statsCards as stat}
			<div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100/50 hover:shadow-xl transition-all group relative overflow-hidden">
				<div class="absolute top-0 right-0 w-24 h-24 {stat.color} opacity-[0.03] rounded-bl-[4rem]"></div>
				<div class="flex items-start justify-between relative z-10">
					<div class="{stat.color} p-4 rounded-2xl shadow-lg {stat.shadow} flex items-center justify-center text-white ring-4 ring-white">
						<stat.icon class="w-6 h-6" />
					</div>
				</div>
				<div class="mt-6">
					<p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.name}</p>
					<p class="text-2xl font-black text-slate-800 mt-2 tracking-tight">{stat.value}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
		<!-- Due Today Section -->
		<div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
			<div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
				<div>
					<h3 class="font-black text-slate-800 flex items-center gap-3">
						<Calendar class="w-6 h-6 text-blue-600" />
						Installments Due Today
					</h3>
					<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Collection Queue</p>
				</div>
				{#if data.todayDue.length > 0}
					<span class="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-blue-200">
						{data.todayDue.length} PENDING
					</span>
				{/if}
			</div>
			<div class="flex-1 divide-y divide-slate-50">
				{#each data.todayDue as item}
					<div class="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
						<div class="flex items-center gap-5">
							<div class="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-400">
								{item.plan.customer.name.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<p class="text-md font-black text-slate-800 leading-tight">{item.plan.customer.name}</p>
								<p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{item.plan.product.name}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-lg font-black text-blue-600">{formatCurrency(item.amount)}</p>
							<a 
								href="/installments/{item.plan.id}" 
								class="text-[9px] font-black text-slate-300 hover:text-blue-500 uppercase tracking-[0.2em] transition-colors"
							>
								Open Ledger
							</a>
						</div>
					</div>
				{:else}
					<div class="py-20 flex flex-col items-center justify-center text-center px-8">
						<div class="bg-emerald-50 p-6 rounded-full mb-4">
							<CheckCircle2 class="w-10 h-10 text-emerald-400" />
						</div>
						<h4 class="font-black text-slate-800">Relax, You're All Caught Up!</h4>
						<p class="text-sm text-slate-400 font-medium mt-2">No installments are due for collection today.</p>
					</div>
				{/each}
			</div>
			{#if data.todayDue.length > 0}
				<div class="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
					<button class="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:gap-3 transition-all">
						Print Collection Sheet
						<ArrowRight class="w-4 h-4" />
					</button>
				</div>
			{/if}
		</div>

		<!-- Overdue List -->
		<div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
			<div class="p-8 border-b border-slate-50 flex items-center justify-between bg-red-50/30">
				<div>
					<h3 class="font-black text-slate-800 flex items-center gap-3">
						<AlertTriangle class="w-6 h-6 text-red-500" />
						Critical Overdue
					</h3>
					<p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">Pending from past dates</p>
				</div>
			</div>
			<div class="flex-1 divide-y divide-slate-50">
				{#each data.overdueInstallments as item}
					<div class="p-6 hover:bg-red-50/30 transition-all flex items-center justify-between group">
						<div class="flex items-center gap-5">
							<div class="w-14 h-14 rounded-2xl bg-white shadow-sm border border-red-50 flex items-center justify-center font-black text-red-300">
								{item.plan.customer.name.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<p class="text-md font-black text-slate-800 leading-tight">{item.plan.customer.name}</p>
								<p class="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1">Due Date: {new Date(item.dueDate).toLocaleDateString()}</p>
							</div>
						</div>
						<div class="text-right">
							<p class="text-lg font-black text-red-600">{formatCurrency(item.pendingAmount)}</p>
							<a 
								href="/installments/{item.plan.id}" 
								class="text-[9px] font-black text-slate-300 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
							>
								Recovery Action
							</a>
						</div>
					</div>
				{:else}
					<div class="py-20 flex flex-col items-center justify-center text-center px-8">
						<div class="bg-blue-50 p-6 rounded-full mb-4">
							<ShieldCheck class="w-10 h-10 text-blue-400" />
						</div>
						<h4 class="font-black text-slate-800">Excellent Recovery Rate</h4>
						<p class="text-sm text-slate-400 font-medium mt-2">There are currently no overdue installments.</p>
					</div>
				{/each}
			</div>
			{#if data.overdueInstallments.length > 0}
				<div class="p-6 bg-red-50/10 border-t border-slate-50 text-center">
					<a href="/reports" class="text-xs font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:gap-3 transition-all">
						Full Defaulter List
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
