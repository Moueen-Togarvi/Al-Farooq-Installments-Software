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
			case 'PAID': return 'bg-gray-900 text-white border-gray-900';
			case 'PARTIAL': return 'bg-amber-50 text-amber-700 border-amber-200';
			case 'UNPAID': return 'bg-gray-50 text-gray-500 border-gray-200';
			default: return 'bg-gray-50 text-gray-500 border-gray-200';
		}
	}
</script>

<div class="max-w-6xl mx-auto space-y-6">
	<!-- Header & Actions -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
		<div class="flex items-center gap-4">
			<a href="/installments" class="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors shadow-sm">
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-2xl font-bold text-gray-900 tracking-tight leading-none">Installment Ledger</h1>
				<p class="text-xs text-gray-500 font-semibold mt-1.5 uppercase tracking-wider">Plan ID: #{data.plan.id.substring(0, 8)}</p>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<button 
				onclick={() => window.print()}
				class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
			>
				<Printer class="w-4 h-4" />
				Print Card
			</button>
			<button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-sm text-sm">
				<Download class="w-4 h-4" />
				Export PDF
			</button>
		</div>
	</div>

	<!-- Info Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
		<!-- Customer Card -->
		<div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
			<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 shrink-0">
				<User class="w-5 h-5" />
			</div>
			<div class="space-y-1">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">Customer</h3>
				<p class="text-base font-bold text-gray-900 leading-tight pt-0.5">{data.plan.customer.name}</p>
				<p class="text-xs font-medium text-gray-500 truncate max-w-[150px]">{data.plan.customer.address}</p>
			</div>
		</div>

		<!-- Product Card -->
		<div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
			<div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 shrink-0">
				<Package class="w-5 h-5" />
			</div>
			<div class="space-y-1">
				<h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none">Product</h3>
				<p class="text-base font-bold text-gray-900 leading-tight pt-0.5">{data.plan.product.name}</p>
				<p class="text-xs font-semibold text-gray-600 uppercase tracking-wider">{data.plan.product.category}</p>
			</div>
		</div>

		<!-- Financial Summary -->
		<div class="bg-gray-900 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
			<div class="flex justify-between items-center relative z-10">
				<div class="space-y-1.5">
					<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remaining Balance</h3>
					<p class="text-2xl font-bold">{formatCurrency(data.plan.remainingBalance)}</p>
				</div>
				<TrendingUp class="w-8 h-8 text-white opacity-20" />
			</div>
		</div>
	</div>

	<!-- Ledger Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-gray-300">
		<div class="px-6 py-5 border-b border-gray-200 print:pb-4 flex items-center gap-2">
			<Calendar class="w-5 h-5 text-gray-500" />
			<h2 class="text-lg font-bold text-gray-900">Installment Schedule</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-200 print:bg-transparent">
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">No.</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid Date</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center print:hidden">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.plan.installments as installment, i}
						<tr class="hover:bg-gray-50/50 transition-colors group {installment.status === 'PAID' ? 'bg-gray-50/30' : ''}">
							<td class="px-6 py-4 text-center font-bold text-gray-500 text-sm">#{installment.serialNumber}</td>
							<td class="px-6 py-4 text-sm font-semibold text-gray-900">{formatDate(installment.dueDate)}</td>
							<td class="px-6 py-4 text-sm font-bold text-gray-900">{formatCurrency(installment.amount)}</td>
							<td class="px-6 py-4 text-sm font-semibold text-gray-700">{formatCurrency(installment.receivedAmount)}</td>
							<td class="px-6 py-4 text-sm font-bold text-red-600">{formatCurrency(installment.pendingAmount)}</td>
							<td class="px-6 py-4 text-sm font-medium text-gray-500">{formatDate(installment.paymentDate)}</td>
							<td class="px-6 py-4">
								<span class="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border {getStatusStyles(installment.status)}">
									{installment.status}
								</span>
							</td>
							<td class="px-6 py-4 text-center print:hidden">
								{#if installment.status !== 'PAID'}
									<button 
										onclick={() => {
											selectedInstallment = installment;
											paymentAmount = parseFloat(installment.pendingAmount);
										}}
										class="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors shadow-sm"
									>
										Pay
									</button>
								{:else}
									<CheckCircle2 class="w-5 h-5 text-gray-400 mx-auto" />
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
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 overflow-hidden transform transition-all">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
				<div>
					<h2 class="text-lg font-bold text-gray-900 leading-none">Record Payment</h2>
					<p class="text-xs font-semibold text-gray-500 mt-1.5 uppercase tracking-wider">Installment No. {selectedInstallment.serialNumber}</p>
				</div>
				<button 
					onclick={() => selectedInstallment = null}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
				>
					<XCircle class="w-5 h-5" />
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
				class="p-6 space-y-6"
			>
				<input type="hidden" name="installmentId" value={selectedInstallment.id} />
				
				<div class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
					<div class="space-y-1">
						<p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Due</p>
						<p class="text-base font-bold text-gray-900">{formatCurrency(selectedInstallment.amount)}</p>
					</div>
					<div class="text-right space-y-1">
						<p class="text-xs font-semibold text-red-600 uppercase tracking-wider">Remaining</p>
						<p class="text-base font-bold text-red-600">{formatCurrency(selectedInstallment.pendingAmount)}</p>
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="amount" class="text-sm font-semibold text-gray-700">Payment Amount (PKR)</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
							<DollarSign class="w-5 h-5 text-gray-400" />
						</div>
						<input 
							type="number" 
							name="amount" 
							id="amount" 
							bind:value={paymentAmount}
							step="0.01"
							required 
							class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 font-bold text-lg" 
						/>
					</div>
					<p class="text-xs text-gray-500">Supports partial payments. Balance auto-calculates.</p>
				</div>

				<div class="space-y-1.5">
					<label for="method" class="text-sm font-semibold text-gray-700">Payment Method</label>
					<select 
						name="method" 
						id="method"
						class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 font-medium appearance-none cursor-pointer"
					>
						<option value="CASH">Cash in Hand</option>
						<option value="BANK">Bank Transfer</option>
						<option value="CHEQUE">Cheque</option>
						<option value="E-PAISA">EasyPaisa / JazzCash</option>
					</select>
				</div>

				<div class="flex flex-col gap-2 pt-2 border-t border-gray-100">
					<button 
						type="submit"
						class="w-full py-3 rounded-lg bg-gray-900 text-white font-medium shadow-sm hover:bg-gray-800 transition-colors text-sm"
					>
						Confirm Payment
					</button>
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
		.bg-gray-900 {
			background: black !important;
			color: white !important;
		}
	}
</style>
