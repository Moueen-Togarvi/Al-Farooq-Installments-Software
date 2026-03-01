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

	<!-- Plan Table -->
	<div class="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-x-auto">
		<table class="w-full text-left border-collapse min-w-[1000px]">
			<thead>
				<tr class="bg-gray-50 border-b-2 border-gray-200">
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan Details</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Info</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Financials</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y-2 divide-gray-100">
				{#each filteredPlans as plan}
					<tr class="hover:bg-gray-50 transition-colors group">
						<td class="px-6 py-4">
							<div class="space-y-1">
								<p class="text-xs font-black text-black">#{plan.id.substring(0, 8).toUpperCase()}</p>
								<span class="inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border {getPlanStatusColor(plan.status)}">
									{plan.status}
								</span>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center gap-3">
								<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm">
									{plan.customer.name.substring(0, 2).toUpperCase()}
								</div>
								<p class="text-sm font-black text-black tracking-wide">{plan.customer.name}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="space-y-0.5">
								<p class="text-sm font-black text-gray-900">{plan.product.name}</p>
								<p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{plan.product.category}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="space-y-0.5">
								<p class="text-xs font-bold text-gray-600">Total: <span class="font-black text-black">{formatCurrency(plan.totalAmount)}</span></p>
								<p class="text-[10px] font-bold text-red-600 uppercase tracking-wider">Remaining: <span class="font-black text-red-600">{formatCurrency(plan.remainingBalance)}</span></p>
							</div>
						</td>
						<td class="px-6 py-4 w-48">
							<div class="space-y-1.5 w-full">
								<div class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
									<span class="text-gray-500">Recovery</span>
									<span class="text-black">{calculateProgress(plan)}%</span>
								</div>
								<div class="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
									<div 
										class="h-full bg-black rounded-full transition-all duration-1000" 
										style="width: {calculateProgress(plan)}%"
									></div>
								</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center justify-center">
								<div class="flex items-center gap-1 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
									<a 
										href="/installments/{plan.id}"
										class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-[10px] font-black uppercase tracking-wider text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-colors shadow-sm"
									>
										View Ledger <ArrowRight class="w-3.5 h-3.5" />
									</a>
								</div>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="px-6 py-16 text-center">
							<div class="flex flex-col items-center gap-2">
								<TrendingUp class="w-10 h-10 text-gray-300 mb-2" />
								<p class="text-black font-black uppercase tracking-widest text-sm">No active installment plans</p>
								<p class="text-xs font-bold text-gray-500">Create your first sale to start tracking installments</p>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
