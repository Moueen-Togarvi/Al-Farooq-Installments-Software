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

<div class="space-y-8">
	<!-- Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
		<div>
			<h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none">Financial Reports</h1>
			<p class="text-sm text-slate-500 font-medium mt-2">Comprehensive data for collections and defaults</p>
		</div>
		<div class="flex items-center gap-3">
			<button 
				onclick={() => window.print()}
				class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
			>
				<Printer class="w-4 h-4" />
				Print Report
			</button>
			<button class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
				<Download class="w-4 h-4" />
				Export Excel
			</button>
		</div>
	</div>

	<!-- Report Filters -->
	<div class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap items-center gap-6 print:hidden">
		<div class="flex bg-slate-100 p-1.5 rounded-2xl">
			<a 
				href="?type=daily" 
				class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all {data.type === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
			>
				Daily Collection
			</a>
			<a 
				href="?type=defaulters" 
				class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all {data.type === 'defaulters' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
			>
				Defaulter List
			</a>
		</div>

		{#if data.type === 'daily'}
			<form class="flex items-center gap-4">
				<input type="hidden" name="type" value="daily" />
				<div class="relative">
					<Calendar class="absolute left-4 inset-y-0 my-auto w-4 h-4 text-slate-400" />
					<input 
						type="date" 
						name="date" 
						value={data.date}
						onchange={(e) => (e.currentTarget as HTMLInputElement).form?.submit()}
						class="pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-xs font-bold text-slate-700" 
					/>
				</div>
			</form>
		{/if}
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
		<div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
			<div class="space-y-1">
				<h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{data.type === 'daily' ? 'Total Collection' : 'Total Outstanding'}</h3>
				<p class="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(data.summary.total)}</p>
			</div>
			<div class="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
				<TrendingUp class="w-8 h-8" />
			</div>
		</div>
		<div class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
			<div class="space-y-1">
				<h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{data.type === 'daily' ? 'Transactions' : 'Defaulters'}</h3>
				<p class="text-3xl font-black text-slate-800 tracking-tight">{data.summary.count}</p>
			</div>
			<div class="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
				<FileText class="w-8 h-8" />
			</div>
		</div>
	</div>

	<!-- Report Table -->
	<div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/50 border-b border-slate-100">
						{#if data.type === 'daily'}
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
						{:else}
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</th>
							<th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
						{/if}
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#each data.reportData as item}
						<tr class="hover:bg-slate-50/50 transition-all">
							{#if data.type === 'daily'}
								<td class="px-8 py-6">
									<div class="flex items-center gap-4">
										<div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
											{item.installment.plan.customer.name.substring(0, 2).toUpperCase()}
										</div>
										<p class="text-sm font-bold text-slate-800">{item.installment.plan.customer.name}</p>
									</div>
								</td>
								<td class="px-8 py-6 text-sm font-bold text-slate-600">{item.installment.plan.product.name}</td>
								<td class="px-8 py-6">
									<span class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100">
										{item.method}
									</span>
								</td>
								<td class="px-8 py-6 text-md font-black text-emerald-600">{formatCurrency(item.amount)}</td>
								<td class="px-8 py-6 text-xs font-bold text-slate-400 italic">
									{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</td>
							{:else}
								<td class="px-8 py-6">
									<div class="flex items-center gap-4">
										<div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center font-black text-red-300 text-xs">
											{item.plan.customer.name.substring(0, 2).toUpperCase()}
										</div>
										<p class="text-sm font-bold text-slate-800">{item.plan.customer.name}</p>
									</div>
								</td>
								<td class="px-8 py-6 text-sm font-bold text-slate-600">{item.plan.product.name}</td>
								<td class="px-8 py-6 text-sm font-black text-red-400">{formatDate(item.dueDate)}</td>
								<td class="px-8 py-6 text-md font-black text-red-600">{formatCurrency(item.pendingAmount)}</td>
								<td class="px-8 py-6">
									<a 
										href="/installments/{item.plan.id}" 
										class="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all"
									>
										Ledger <ArrowRight class="w-4 h-4" />
									</a>
								</td>
							{/if}
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-8 py-32 text-center">
								<div class="flex flex-col items-center gap-4">
									<div class="bg-slate-50 p-6 rounded-full">
										<Tag class="w-8 h-8 text-slate-200" />
									</div>
									<div>
										<p class="text-slate-400 font-bold text-md">No data available for this report</p>
										<p class="text-xs text-slate-300 font-medium uppercase tracking-widest mt-2 transition-all">Check another date or filter</p>
									</div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
			border: 1px solid #e2e8f0 !important;
			box-shadow: none !important;
		}
		.rounded-\[2\.5rem\], .rounded-\[3rem\], .rounded-3xl {
			border-radius: 1rem !important;
		}
	}
</style>
