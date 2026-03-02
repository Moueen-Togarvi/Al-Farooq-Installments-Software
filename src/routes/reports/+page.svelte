<script lang="ts">
	import { 
		Search, 
		Printer, 
		FileText, 
		Calendar, 
		Download, 
		Filter, 
		TrendingUp, 
		AlertTriangle, 
		Tag,
		ArrowRight
	} from 'lucide-svelte';
	import { page } from '$app/state';

	let { data } = $props();

	function formatCurrency(amount: any) {
		return new Intl.NumberFormat('en-PK', { 
			style: 'currency', 
			currency: 'PKR', 
			minimumFractionDigits: 0 
		}).format(parseFloat(amount?.toString() || '0'));
	}

	function formatDate(date: any) {
		return new Date(date).toLocaleDateString('en-GB', { 
			day: '2-digit', 
			month: 'short', 
			year: 'numeric' 
		});
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 tracking-tight leading-none">Financial Reports</h1>
			<p class="text-sm text-gray-500 font-medium mt-1">Comprehensive data for collections and defaults</p>
		</div>
		<div class="flex items-center gap-3">
			<button 
				onclick={() => window.print()}
				class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
			>
				<Printer class="w-4 h-4" />
				Print Report
			</button>
			<button class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
				<Download class="w-4 h-4" />
				Export Excel
			</button>
		</div>
	</div>

	<!-- Report Filters -->
	<div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4 print:hidden">
		<div class="flex bg-gray-100 p-1 rounded-lg">
			<a 
				href="?type=daily" 
				class="px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors {data.type === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
			>
				Daily Collection
			</a>
			<a 
				href="?type=defaulters" 
				class="px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors {data.type === 'defaulters' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
			>
				Defaulter List
			</a>
		</div>

		{#if data.type === 'daily'}
			<form class="flex items-center gap-4">
				<input type="hidden" name="type" value="daily" />
				<div class="relative">
					<Calendar class="absolute left-3 inset-y-0 my-auto w-4 h-4 text-gray-400" />
					<input 
						type="date" 
						name="date" 
						value={data.date}
						onchange={(e) => (e.currentTarget as HTMLInputElement).form?.submit()}
						class="pl-9 pr-3 py-1.5 bg-gray-50 rounded-lg border border-transparent focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors outline-none text-xs font-semibold text-gray-900" 
					/>
				</div>
			</form>
		{/if}
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
		<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
			<div class="space-y-1.5">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{data.type === 'daily' ? 'Total Collection' : 'Total Outstanding'}</h3>
				<p class="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(data.summary.total)}</p>
			</div>
			<div class="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
				<TrendingUp class="w-6 h-6" />
			</div>
		</div>
		<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
			<div class="space-y-1.5">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{data.type === 'daily' ? 'Transactions' : 'Defaulters'}</h3>
				<p class="text-2xl font-bold text-gray-900 tracking-tight">{data.summary.count}</p>
			</div>
			<div class="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
				<FileText class="w-6 h-6" />
			</div>
		</div>
	</div>

	<!-- Report Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
		<!-- Desktop View -->
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[600px]">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-100">
						{#if data.type === 'daily'}
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Method</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Time</th>
						{:else}
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Pending</th>
							<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
						{/if}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each data.reportData as item}
						<tr class="hover:bg-gray-50/50 transition-colors">
							{#if data.type === 'daily'}
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm">
											{item.installment.plan.customer.name.substring(0, 2).toUpperCase()}
										</div>
										<p class="text-sm font-black text-gray-900">{item.installment.plan.customer.name}</p>
									</div>
								</td>
								<td class="px-6 py-4 text-sm font-black text-gray-600">{item.installment.plan.product.name}</td>
								<td class="px-6 py-4 text-center">
									<span class="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest border border-gray-200">
										{item.method}
									</span>
								</td>
								<td class="px-6 py-4 text-right text-sm font-black text-gray-900">{formatCurrency(item.amount)}</td>
								<td class="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
									{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</td>
							{:else}
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm">
											{item.plan.customer.name.substring(0, 2).toUpperCase()}
										</div>
										<p class="text-sm font-black text-gray-900">{item.plan.customer.name}</p>
									</div>
								</td>
								<td class="px-6 py-4 text-sm font-black text-gray-600">{item.plan.product.name}</td>
								<td class="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{formatDate(item.dueDate)}</td>
								<td class="px-6 py-4 text-right text-sm font-black text-red-600">{formatCurrency(item.pendingAmount)}</td>
								<td class="px-6 py-4 flex items-center justify-center">
									<a 
										href="/installments/{item.plan.id}" 
										class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm active:scale-95"
									>
										Ledger <ArrowRight class="w-3 h-3" />
									</a>
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-16 text-center">
								<div class="flex flex-col items-center gap-3">
									<Tag class="w-8 h-8 text-gray-200" />
									<div>
										<p class="text-gray-400 font-black text-[10px] uppercase tracking-widest">No data available for this report</p>
										<p class="text-[10px] text-gray-300 font-bold mt-1">Check another date or filter</p>
									</div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Card View -->
		<div class="md:hidden flex flex-col divide-y divide-gray-100">
			{#each data.reportData as item}
				<div class="p-4 space-y-4 bg-white">
					{#if data.type === 'daily'}
						<div class="flex items-start justify-between">
							<div class="flex flex-col">
								<p class="text-[10px] font-black text-gray-900 tracking-wider bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200 uppercase mb-1">
									{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</p>
								<p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.method}</p>
							</div>
							<div class="text-right">
								<p class="text-base font-black text-gray-900">{formatCurrency(item.amount)}</p>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
							<div class="flex items-center gap-3 mb-1">
								<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm">
									{item.installment.plan.customer.name.substring(0, 2).toUpperCase()}
								</div>
								<p class="text-sm font-black text-gray-900 tracking-wide">{item.installment.plan.customer.name}</p>
							</div>
							<div class="border-t border-gray-200/60 pt-2">
								<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Product</p>
								<p class="text-xs font-black text-gray-900">{item.installment.plan.product.name}</p>
							</div>
						</div>
					{:else}
						<div class="flex items-start justify-between">
							<div class="flex flex-col">
								<p class="text-[10px] font-black text-red-600 tracking-wider bg-red-50 text-red-700 px-2 py-1 rounded w-fit border border-red-100 uppercase mb-1">
									DUE: {formatDate(item.dueDate)}
								</p>
							</div>
							<div class="text-right">
								<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pending</p>
								<p class="text-base font-black text-red-600">{formatCurrency(item.pendingAmount)}</p>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
							<div class="flex items-center gap-3 mb-1">
								<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm">
									{item.plan.customer.name.substring(0, 2).toUpperCase()}
								</div>
								<p class="text-sm font-black text-gray-900 tracking-wide">{item.plan.customer.name}</p>
							</div>
							<div class="border-t border-gray-200/60 pt-2">
								<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Product</p>
								<p class="text-xs font-black text-gray-900">{item.plan.product.name}</p>
							</div>
						</div>

						<div class="pt-1">
							<a 
								href="/installments/{item.plan.id}" 
								class="w-full flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
							>
								View Ledger <ArrowRight class="w-3.5 h-3.5" />
							</a>
						</div>
					{/if}
				</div>
			{:else}
				<div class="px-6 py-12 text-center">
					<div class="flex flex-col items-center gap-3">
						<Tag class="w-8 h-8 text-gray-200" />
						<div>
							<p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">No data available</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@media print {
		:global(body) {
			background: white !important;
		}
		:global(aside), :global(header) {
			display: none !important;
		}
		:global(main) {
			padding: 0 !important;
			margin-left: 0 !important;
		}
		.bg-white {
			border: 1px solid #e5e7eb !important;
			box-shadow: none !important;
		}
	}
</style>
