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
			<h1 class="text-2xl font-bold text-gray-900 tracking-tight">Payment History</h1>
			<p class="text-sm text-gray-500 font-medium mt-1">View and audit all incoming installments</p>
		</div>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
		<div class="relative flex-1">
			<Search class="absolute left-3 inset-y-0 my-auto w-5 h-5 text-gray-400" />
			<input 
				type="text" 
				placeholder="Search by customer, product, or Receipt ID..." 
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2 bg-transparent border-transparent focus:ring-0 transition-all outline-none text-gray-900 font-medium h-10"
			/>
		</div>
	</div>

	<!-- Payments Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
		<!-- Desktop Table View -->
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[1000px]">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-100">
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Receipt ID / Date</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Info</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Method</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each filteredPayments as payment}
						<tr class="hover:bg-gray-50/50 transition-colors group">
							<td class="px-6 py-4">
								<div class="flex flex-col items-center justify-center text-center">
									<p class="text-[10px] font-black text-gray-900 tracking-wider bg-gray-100 px-2 py-1 rounded-md border border-gray-200 uppercase">
										#{payment.id.slice(-8)}
									</p>
									<p class="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{formatDate(payment.paymentDate)}</p>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm">
										{payment.installment.plan.customer.name.substring(0, 2).toUpperCase()}
									</div>
									<p class="text-sm font-black text-gray-900 tracking-wide">{payment.installment.plan.customer.name}</p>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="space-y-0.5">
									<p class="text-sm font-black text-gray-900">{payment.installment.plan.product.name}</p>
								</div>
							</td>
							<td class="px-6 py-4 text-center">
								<span class="px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-gray-100 text-gray-500 border border-gray-200">
									{payment.method}
								</span>
							</td>
							<td class="px-6 py-4 text-right">
								<p class="text-sm font-black text-gray-900">{formatCurrency(payment.amount)}</p>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-center">
									<div class="flex items-center gap-1.5">
										<a 
											href="/installments/{payment.installment.planId}" 
											class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[9px] font-black uppercase tracking-widest text-blue-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
										>
											View Ledger <ArrowRight class="w-3 h-3" />
										</a>
									</div>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-16 text-center">
								<div class="flex flex-col items-center gap-2">
									<WalletCards class="w-10 h-10 text-gray-200 mb-2" />
									<p class="text-[10px] font-black uppercase tracking-widest text-gray-400">No payments found</p>
									<p class="text-[10px] font-bold text-gray-400">When customers pay, their records will appear here</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Card View -->
		<div class="md:hidden flex flex-col divide-y divide-gray-100">
			{#each filteredPayments as payment}
				<div class="p-4 space-y-4 bg-white">
					<div class="flex items-start justify-between">
						<div class="flex flex-col">
							<p class="text-[10px] font-black text-gray-900 tracking-wider bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200 uppercase mb-1">
								#{payment.id.slice(-8)}
							</p>
							<p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(payment.paymentDate)}</p>
						</div>
						<div class="text-right">
							<p class="text-base font-black text-gray-900">{formatCurrency(payment.amount)}</p>
							<span class="inline-block mt-0.5 px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-gray-100 text-gray-500 border border-gray-200">
								{payment.method}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
						<div class="flex items-center gap-3 mb-1">
							<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white text-[10px] shrink-0 shadow-sm">
								{payment.installment.plan.customer.name.substring(0, 2).toUpperCase()}
							</div>
							<p class="text-sm font-black text-gray-900 tracking-wide">{payment.installment.plan.customer.name}</p>
						</div>
						<div class="border-t border-gray-200/60 pt-2">
							<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Product</p>
							<p class="text-xs font-black text-gray-900">{payment.installment.plan.product.name}</p>
						</div>
					</div>

					<div class="pt-1">
						<a 
							href="/installments/{payment.installment.planId}" 
							class="w-full flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
						>
							View Ledger <ArrowRight class="w-3.5 h-3.5" />
						</a>
					</div>
				</div>
			{:else}
				<div class="px-6 py-12 text-center">
					<div class="flex flex-col items-center gap-2">
						<WalletCards class="w-10 h-10 text-gray-200 mb-2" />
						<p class="text-[10px] font-black uppercase tracking-widest text-gray-400">No payments found</p>
						<p class="text-[10px] font-bold text-gray-400">When customers pay, their records will appear here</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
