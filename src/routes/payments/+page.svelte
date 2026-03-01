<script lang="ts">
	import { 
		WalletCards, 
		Search, 
		Calendar, 
		User, 
		Package, 
		ArrowRight,
		CheckCircle2,
		Receipt
	} from 'lucide-svelte';

	let { data } = $props();
	let searchQuery = $state('');

	const filteredPayments = $derived(
		data.payments.filter((p: any) => 
			p.installment.plan.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			p.installment.plan.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.id.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
	}

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('en-GB', { 
			day: '2-digit', 
			month: 'short', 
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Payment History</h1>
			<p class="text-sm text-slate-500 font-medium">View and audit all incoming installments</p>
		</div>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
		<div class="relative flex-1">
			<Search class="absolute left-4 inset-y-0 my-auto w-5 h-5 text-slate-400" />
			<input 
				type="text" 
				placeholder="Search by customer, product, or Receipt ID..." 
				bind:value={searchQuery}
				class="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700 font-medium h-12"
			/>
		</div>
	</div>

	<!-- Payments Table -->
	<div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/50 border-b border-slate-100">
						<th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction / Date</th>
						<th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
						<th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
						<th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Method</th>
						<th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
						<th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-50">
					{#each filteredPayments as payment}
						<tr class="hover:bg-slate-50/50 transition-colors group">
							<td class="px-6 py-5">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
										<Receipt class="w-5 h-5" />
									</div>
									<div>
										<p class="text-xs font-black text-slate-700 uppercase tracking-tighter line-clamp-1">{payment.id.slice(-8)}</p>
										<p class="text-[10px] font-bold text-slate-400 mt-0.5">{formatDate(payment.paymentDate)}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-5">
								<div class="flex items-center gap-2">
									<User class="w-3.5 h-3.5 text-slate-300" />
									<p class="text-sm font-bold text-slate-700">{payment.installment.plan.customer.name}</p>
								</div>
							</td>
							<td class="px-6 py-5">
								<div class="flex items-center gap-2">
									<Package class="w-3.5 h-3.5 text-slate-300" />
									<p class="text-sm font-bold text-slate-600">{payment.installment.plan.product.name}</p>
								</div>
							</td>
							<td class="px-6 py-5 text-center">
								<span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
									{payment.method}
								</span>
							</td>
							<td class="px-6 py-5 text-right">
								<p class="text-sm font-black text-emerald-600">{formatCurrency(payment.amount)}</p>
							</td>
							<td class="px-6 py-5 text-right">
								<a 
									href="/installments/{payment.installment.planId}" 
									class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm group"
								>
									View Ledger
									<ArrowRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
								</a>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-24 text-center">
								<div class="flex flex-col items-center gap-4">
									<div class="bg-slate-50 p-6 rounded-full">
										<WalletCards class="w-10 h-10 text-slate-200" />
									</div>
									<div class="space-y-1">
										<p class="text-slate-400 font-bold text-lg">No payments found</p>
										<p class="text-sm text-slate-300 font-medium">When customers pay, their records will appear here</p>
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
