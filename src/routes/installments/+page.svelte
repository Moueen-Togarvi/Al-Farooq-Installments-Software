<script lang="ts">
	import { 
		Plus, 
		Search, 
		Calendar, 
		User, 
		Package, 
		TrendingUp, 
		CheckCircle2, 
		Clock,
		ArrowRight,
		Filter
	} from 'lucide-svelte';

	let { data } = $props();
	let searchQuery = $state('');

	const filteredPlans = $derived(
		data.plans.filter((p: any) => 
			p.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			p.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.id.includes(searchQuery)
		)
	);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
	}

	function getPlanStatusColor(status: string) {
		switch (status) {
			case 'ACTIVE': return 'bg-blue-50 text-blue-600 border-blue-100';
			case 'CLOSED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
			case 'DEFAULTED': return 'bg-red-50 text-red-600 border-red-100';
			default: return 'bg-slate-100 text-slate-600 border-slate-200';
		}
	}

	function calculateProgress(plan: any) {
		const total = parseFloat(plan.totalAmount);
		const remaining = parseFloat(plan.remainingBalance);
		const paid = total - remaining;
		return Math.round((paid / total) * 100);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Active Installments</h1>
			<p class="text-sm text-slate-500 font-medium">Monitor ongoing sales and payment progress</p>
		</div>
		<a 
			href="/installments/new"
			class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
		>
			<Plus class="w-5 h-5" />
			New Sale Plan
		</a>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4">
		<div class="relative flex-1 min-w-[300px]">
			<Search class="absolute left-4 inset-y-0 my-auto w-5 h-5 text-slate-400" />
			<input 
				type="text" 
				placeholder="Search by customer, product or plan ID..." 
				bind:value={searchQuery}
				class="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700 font-medium h-12"
			/>
		</div>
		<button class="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-all border border-transparent">
			<Filter class="w-4 h-4" />
			All Status
		</button>
	</div>

	<!-- Plan Grid -->
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
		{#each filteredPlans as plan}
			<div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col md:flex-row h-full">
				<!-- Left Profile Section -->
				<div class="p-8 md:w-56 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center text-center justify-center shrink-0">
					<div class="w-20 h-20 rounded-3xl bg-white shadow-sm border border-slate-200 flex items-center justify-center font-black text-2xl text-slate-400 mb-4">
						{plan.customer.name.substring(0, 2).toUpperCase()}
					</div>
					<h3 class="text-lg font-black text-slate-800 line-clamp-1 leading-tight">{plan.customer.name}</h3>
					<p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-100">
						{plan.product.category}
					</p>
				</div>

				<!-- Content Section -->
				<div class="p-8 flex-1 flex flex-col justify-between">
					<div class="space-y-6">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<h4 class="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Purchased Product</h4>
								<p class="text-lg font-extrabold text-slate-800 leading-tight">{plan.product.name}</p>
							</div>
							<span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border {getPlanStatusColor(plan.status)} shrink-0">
								{plan.status}
							</span>
						</div>

						<div class="grid grid-cols-2 gap-8">
							<div class="space-y-1">
								<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Amount</p>
								<p class="text-md font-black text-slate-700">{formatCurrency(plan.totalAmount)}</p>
							</div>
							<div class="space-y-1">
								<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Remaining</p>
								<p class="text-md font-black text-red-500">{formatCurrency(plan.remainingBalance)}</p>
							</div>
						</div>

						<div class="space-y-3">
							<div class="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
								<span class="text-slate-400">Payment Progress</span>
								<span class="text-slate-800">{calculateProgress(plan)}%</span>
							</div>
							<div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
								<div 
									class="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
									style="width: {calculateProgress(plan)}%"
								></div>
							</div>
						</div>
					</div>

					<div class="pt-8 flex items-center justify-between">
						<div class="flex -space-x-3 overflow-hidden p-1">
							{#each plan.installments.slice(0, 5) as inst}
								<div 
									class="inline-block h-8 w-8 rounded-xl ring-4 ring-white shadow-sm border border-slate-100 flex items-center justify-center text-[8px] font-black {inst.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}"
									title="Month {inst.month}"
								>
									M{inst.serialNumber}
								</div>
							{/each}
							{#if plan.installments.length > 5}
								<div class="inline-block h-8 w-8 rounded-xl ring-4 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
									+{plan.installments.length - 5}
								</div>
							{/if}
						</div>
						<a 
							href="/installments/{plan.id}"
							class="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-all uppercase tracking-widest group"
						>
							View Ledger
							<ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</a>
					</div>
				</div>
			</div>
		{:else}
			<div class="col-span-full py-24 text-center">
				<div class="flex flex-col items-center gap-4">
					<div class="bg-slate-50 p-6 rounded-full">
						<TrendingUp class="w-10 h-10 text-slate-200" />
					</div>
					<div class="space-y-1">
						<p class="text-slate-400 font-bold text-lg">No active installment plans</p>
						<p class="text-sm text-slate-300 font-medium">Create your first sale to start tracking installments</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
