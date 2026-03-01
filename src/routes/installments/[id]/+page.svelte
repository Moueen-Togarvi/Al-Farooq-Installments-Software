<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		ArrowLeft, 
		Printer, 
		CheckCircle2, 
		Clock, 
		AlertTriangle, 
		DollarSign, 
		Download,
		Calendar,
		User,
		Package,
		Tag,
		TrendingUp,
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();
	let selectedInstallment = $state<any>(null);
	let paymentAmount = $state(0);

	function formatCurrency(amount: any) {
		return new Intl.NumberFormat('en-PK', { 
			style: 'currency', 
			currency: 'PKR', 
			minimumFractionDigits: 0 
		}).format(parseFloat(amount?.toString() || '0'));
	}

	function formatDate(date: any) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-GB', { 
			day: '2-digit', 
			month: 'short', 
			year: 'numeric' 
		});
	}

	function getStatusStyles(status: string) {
		switch (status) {
			case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20';
			case 'PARTIAL': return 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/20';
			case 'UNPAID': return 'bg-slate-50 text-slate-400 border-slate-100 ring-slate-500/10';
			default: return 'bg-slate-50 text-slate-400 border-slate-100';
		}
	}
</script>

<div class="max-w-6xl mx-auto space-y-8">
	<!-- Header & Actions -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
		<div class="flex items-center gap-4">
			<a href="/installments" class="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none">Installment Ledger</h1>
				<p class="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Plan ID: #{data.plan.id.substring(0, 8)}</p>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<button 
				onclick={() => window.print()}
				class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
			>
				<Printer class="w-4 h-4" />
				Print Card
			</button>
			<button class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
				<Download class="w-4 h-4" />
				Export PDF
			</button>
		</div>
	</div>

	<!-- Info Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
		<!-- Customer Card -->
		<div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4">
			<div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
				<User class="w-7 h-7" />
			</div>
			<div class="space-y-1">
				<h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Customer</h3>
				<p class="text-md font-black text-slate-800 leading-tight">{data.plan.customer.name}</p>
				<p class="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{data.plan.customer.address}</p>
			</div>
		</div>

		<!-- Product Card -->
		<div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4">
			<div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
				<Package class="w-7 h-7" />
			</div>
			<div class="space-y-1">
				<h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Product</h3>
				<p class="text-md font-black text-slate-800 leading-tight">{data.plan.product.name}</p>
				<p class="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{data.plan.product.category}</p>
			</div>
		</div>

		<!-- Financial Summary -->
		<div class="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white flex flex-col justify-center">
			<div class="flex justify-between items-center px-2">
				<div class="space-y-1">
					<h3 class="text-[9px] font-black text-slate-400 uppercase tracking-widest shadow-slate-900">Remaining Balance</h3>
					<p class="text-2xl font-black">{formatCurrency(data.plan.remainingBalance)}</p>
				</div>
				<TrendingUp class="w-8 h-8 text-blue-500 opacity-50" />
			</div>
		</div>
	</div>

	<!-- Ledger Table -->
	<div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden print:border-slate-300">
		<div class="p-8 border-b border-slate-50 print:pb-4">
			<h2 class="text-xl font-black text-slate-800 flex items-center gap-3">
				<Calendar class="w-6 h-6 text-blue-600" />
				Installment Schedule
			</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/50 border-b border-slate-100 print:bg-transparent">
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">No.</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Due Date</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Received</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Pending</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Paid Date</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center print:hidden">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.plan.installments as installment, i}
						<tr class="hover:bg-slate-50/50 transition-colors group {installment.status === 'PAID' ? 'opacity-80' : ''}">
							<td class="px-6 py-5 text-center font-black text-slate-400 text-sm">#{installment.serialNumber}</td>
							<td class="px-6 py-5 text-sm font-bold text-slate-700">{formatDate(installment.dueDate)}</td>
							<td class="px-6 py-5 text-sm font-black text-slate-800">{formatCurrency(installment.amount)}</td>
							<td class="px-6 py-5 text-sm font-bold text-emerald-600">{formatCurrency(installment.receivedAmount)}</td>
							<td class="px-6 py-5 text-sm font-bold text-red-500">{formatCurrency(installment.pendingAmount)}</td>
							<td class="px-6 py-5 text-sm font-medium text-slate-500">{formatDate(installment.paymentDate)}</td>
							<td class="px-6 py-5">
								<span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ring-2 transition-all {getStatusStyles(installment.status)}">
									{installment.status}
								</span>
							</td>
							<td class="px-6 py-5 text-center print:hidden">
								{#if installment.status !== 'PAID'}
									<button 
										onclick={() => {
											selectedInstallment = installment;
											paymentAmount = parseFloat(installment.pendingAmount);
										}}
										class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
									>
										Pay
									</button>
								{:else}
									<CheckCircle2 class="w-6 h-6 text-emerald-500 mx-auto" />
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Payment Modal -->
{#if selectedInstallment}
	<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
			<div class="p-8 border-b border-slate-50 flex items-center justify-between">
				<div>
					<h2 class="text-xl font-black text-slate-800 leading-none">Record Payment</h2>
					<p class="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Installment No. {selectedInstallment.serialNumber}</p>
				</div>
				<button 
					onclick={() => selectedInstallment = null}
					class="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
				>
					<XCircle class="w-6 h-6" />
				</button>
			</div>

			<form 
				method="POST" 
				action="?/recordPayment" 
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							selectedInstallment = null;
						}
					};
				}}
				class="p-8 space-y-8"
			>
				<input type="hidden" name="installmentId" value={selectedInstallment.id} />
				
				<div class="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/30 flex justify-between items-center">
					<div class="space-y-1">
						<p class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Monthly Due</p>
						<p class="text-lg font-black text-blue-800">{formatCurrency(selectedInstallment.amount)}</p>
					</div>
					<div class="text-right space-y-1">
						<p class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Remaining</p>
						<p class="text-lg font-black text-amber-600">{formatCurrency(selectedInstallment.pendingAmount)}</p>
					</div>
				</div>

				<div class="space-y-3">
					<label for="amount" class="text-sm font-black text-slate-700 ml-1 uppercase tracking-[0.1em]">Payment Amount (PKR)</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
							<DollarSign class="w-5 h-5 text-slate-400" />
						</div>
						<input 
							type="number" 
							name="amount" 
							id="amount" 
							bind:value={paymentAmount}
							step="0.01"
							required 
							class="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-slate-800 font-black text-xl rounded-2xl h-20" 
						/>
					</div>
					<p class="text-[10px] text-slate-400 font-bold italic ml-2">Supports partial payments. Balance will auto-calculate.</p>
				</div>

				<div class="space-y-3">
					<label for="method" class="text-sm font-black text-slate-700 ml-1 uppercase tracking-[0.1em]">Payment Method</label>
					<select 
						name="method" 
						id="method"
						class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold appearance-none cursor-pointer h-14"
					>
						<option value="CASH">Cash in Hand</option>
						<option value="BANK">Bank Transfer</option>
						<option value="CHEQUE">Cheque</option>
						<option value="E-PAISA">EasyPaisa / JazzCash</option>
					</select>
				</div>

				<div class="flex flex-col gap-3 pt-2">
					<button 
						type="submit"
						class="w-full py-5 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
					>
						Confirm Payment
					</button>
					<p class="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">Secured Transaction</p>
				</div>
			</form>
		</div>
	</div>
{/if}

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
		.bg-slate-900 {
			background: black !important;
			color: white !important;
		}
		.rounded-\[2\.5rem\], .rounded-\[2rem\] {
			border-radius: 1rem !important;
		}
	}
</style>
