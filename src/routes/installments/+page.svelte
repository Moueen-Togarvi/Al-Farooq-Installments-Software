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
			case 'ACTIVE': return 'bg-gray-100 text-gray-700 border-gray-200';
			case 'CLOSED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 'DEFAULTED': return 'bg-red-50 text-red-700 border-red-200';
			default: return 'bg-white text-gray-500 border-gray-200';
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
			<h1 class="text-2xl font-bold text-gray-900 tracking-tight">Active Installments</h1>
			<p class="text-sm text-gray-500 font-medium">Monitor ongoing sales and payment progress</p>
		</div>
		<a 
			href="/installments/new"
			class="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
		>
			<Plus class="w-4 h-4" />
			New Sale Plan
		</a>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4">
		<div class="relative flex-1 min-w-[300px]">
			<Search class="absolute left-3 inset-y-0 my-auto w-5 h-5 text-gray-400" />
			<input 
				type="text" 
				placeholder="Search by customer, product or plan ID..." 
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2 bg-transparent border-transparent focus:ring-0 transition-all outline-none text-gray-900 font-medium h-10"
			/>
		</div>
		<button class="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors border border-gray-200 border-transparent">
			<Filter class="w-4 h-4" />
			All Status
		</button>
	</div>

	<!-- Plan Grid -->
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
		{#each filteredPlans as plan}
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col md:flex-row h-full">
				<!-- Left Profile Section -->
				<div class="p-6 md:w-56 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center text-center justify-center shrink-0">
					<div class="w-16 h-16 rounded-full bg-gray-100 shadow-sm border border-gray-200 flex items-center justify-center font-bold text-xl text-gray-600 mb-3">
						{plan.customer.name.substring(0, 2).toUpperCase()}
					</div>
					<h3 class="text-base font-bold text-gray-900 line-clamp-1 leading-tight">{plan.customer.name}</h3>
					<p class="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-200">
						{plan.product.category}
					</p>
				</div>

				<!-- Content Section -->
				<div class="p-6 flex-1 flex flex-col justify-between">
					<div class="space-y-5">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">Purchased Product</h4>
								<p class="text-base font-bold text-gray-900 leading-tight pt-1">{plan.product.name}</p>
							</div>
							<span class="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border {getPlanStatusColor(plan.status)} shrink-0">
								{plan.status}
							</span>
						</div>

						<div class="grid grid-cols-2 gap-6">
							<div class="space-y-1">
								<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">Total Amount</p>
								<p class="text-sm font-bold text-gray-900 pt-1">{formatCurrency(plan.totalAmount)}</p>
							</div>
							<div class="space-y-1">
								<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">Remaining</p>
								<p class="text-sm font-bold text-red-600 pt-1">{formatCurrency(plan.remainingBalance)}</p>
							</div>
						</div>

						<div class="space-y-2 pt-2">
							<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
								<span class="text-gray-500">Payment Progress</span>
								<span class="text-gray-900">{calculateProgress(plan)}%</span>
							</div>
							<div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
								<div 
									class="h-full bg-gray-900 rounded-full transition-all duration-1000" 
									style="width: {calculateProgress(plan)}%"
								></div>
							</div>
						</div>
					</div>

					<div class="pt-6 flex items-center justify-between">
						<div class="flex -space-x-2 overflow-hidden py-1">
							{#each plan.installments.slice(0, 5) as inst}
								<div 
									class="inline-block h-8 w-8 rounded-full ring-2 ring-white shadow-sm border border-gray-200 flex items-center justify-center text-[10px] font-bold {inst.status === 'PAID' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400'}"
									title="Month {inst.month}"
								>
									M{inst.serialNumber}
								</div>
							{/each}
							{#if plan.installments.length > 5}
								<div class="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
									+{plan.installments.length - 5}
								</div>
							{/if}
						</div>
						<a 
							href="/installments/{plan.id}"
							class="flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-gray-700 transition-colors uppercase tracking-wider group"
						>
							View Ledger
							<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
						</a>
					</div>
				</div>
			</div>
		{:else}
			<div class="col-span-full py-16 text-center">
				<div class="flex flex-col items-center gap-2">
					<TrendingUp class="w-8 h-8 text-gray-300 mb-2" />
					<p class="text-gray-900 font-medium text-sm">No active installment plans</p>
					<p class="text-xs text-gray-500">Create your first sale to start tracking installments</p>
				</div>
			</div>
		{/each}
	</div>
</div>
