<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		ArrowLeft, 
		Printer, 
		CheckCircle2, 
		XCircle,
		DollarSign
	} from 'lucide-svelte';

	let { data, form } = $props();
	let selectedInstallment = $state<any>(null);
	let paymentAmount = $state(0);

	function formatCurrency(amount: any) {
		return Number(amount || 0).toLocaleString('en-PK');
	}

	function formatDateShort(date: any) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-GB', { 
			day: '2-digit', 
			month: '2-digit', 
			year: 'numeric' 
		});
	}

	function getMonthName(date: any) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-US', { month: 'long' });
	}

	function getYear(date: any) {
		if (!date) return '';
		return new Date(date).getFullYear();
	}
	
	const totalInstallmentSum = data.plan.installments.reduce((acc: number, cur: any) => acc + Number(cur.amount), 0);
	const totalReceivedSum = data.plan.installments.reduce((acc: number, cur: any) => acc + Number(cur.receivedAmount), 0);
	const totalPendingSum = data.plan.installments.reduce((acc: number, cur: any) => acc + Number(cur.pendingAmount), 0);

</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Actions -->
	<div class="flex items-center justify-between print:hidden">
		<a href="/installments" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
			<ArrowLeft class="w-4 h-4" /> Back to Plans
		</a>
		<button 
			onclick={() => window.print()}
			class="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors shadow-md"
		>
			<Printer class="w-4 h-4" />
			Print Ledger Card
		</button>
	</div>

	<!-- Printable Ledger Card -->
	<div class="receipt-card bg-white mx-auto shadow-sm border border-gray-300">
		<!-- Header -->
		<div class="text-center pb-2 border-b-2 border-black receipt-header">
			<h1 class="text-3xl md:text-4xl font-black uppercase tracking-wider text-black pt-4 pb-1 font-serif">Al Farooq Electronics</h1>
		</div>
		<div class="text-center py-1.5 border-b-2 border-black receipt-subheader">
			<p class="text-base md:text-lg font-bold text-black tracking-widest">PH.0322-8736026 : 0349-7379944</p>
		</div>

		<!-- Customer Info Grid -->
		<div class="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black info-grid">
			<div class="flex border-b-2 border-black">
				<div class="w-32 md:w-40 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">Customer Name:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">{data.plan.customer.name}</div>
			</div>
			<div class="flex border-b-2 border-black">
				<div class="w-24 md:w-32 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">Ref Name:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">{data.plan.customer.referenceName || '-'}</div>
			</div>
			
			<div class="flex col-span-2 border-b-2 border-black">
				<div class="w-32 md:w-40 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">Home Address:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">{data.plan.customer.address}</div>
			</div>

			<div class="flex border-b-2 border-black">
				<div class="w-32 md:w-40 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">Mobile #:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">{data.plan.customer.mobile}</div>
			</div>
			<div class="flex border-b-2 border-black">
				<div class="w-24 md:w-32 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">NIC #:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">{data.plan.customer.cnic}</div>
			</div>

			<div class="flex">
				<div class="w-32 md:w-40 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">Item Name:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">{data.plan.product.name}</div>
			</div>
			<div class="flex">
				<div class="w-24 md:w-32 font-bold p-2 border-r-2 border-black bg-gray-50/50 flex items-center print:bg-transparent text-sm">Bill #:</div>
				<div class="flex-1 p-2 font-bold text-sm flex items-center justify-center text-center">#{data.plan.id.substring(0,6).toUpperCase()}</div>
			</div>
		</div>

		<!-- Table -->
		<table class="w-full text-center border-collapse">
			<thead>
				<tr class="border-b-2 border-black bg-gray-50/50 print:bg-transparent">
					<th class="p-2 border-r-2 border-black font-bold text-sm w-12">Sr#</th>
					<th class="p-2 border-r-2 border-black font-bold text-sm">Month</th>
					<th class="p-2 border-r-2 border-black font-bold text-sm">Year</th>
					<th class="p-2 border-r-2 border-black font-bold text-sm">Installment</th>
					<th class="p-2 border-r-2 border-black font-bold text-sm">Receive</th>
					<th class="p-2 border-r-2 border-black font-bold text-sm">pending</th>
					<th class="p-2 border-r-2 border-black font-bold text-sm">Date</th>
					<th class="p-2 font-bold text-sm w-24">Sign</th>
				</tr>
			</thead>
			<tbody>
				{#each data.plan.installments as installment (installment.id)}
					<tr class="border-b border-black print:border-black hover:bg-gray-50/30">
						<td class="p-2 border-r border-black font-bold text-sm">{installment.serialNumber}</td>
						<td class="p-2 border-r border-black font-bold text-sm">{getMonthName(installment.dueDate)}</td>
						<td class="p-2 border-r border-black font-bold text-sm">{getYear(installment.dueDate)}</td>
						<td class="p-2 border-r border-black font-bold text-sm">{formatCurrency(installment.amount)}</td>
						<td class="p-2 border-r border-black font-bold text-sm">
							{installment.receivedAmount > 0 ? formatCurrency(installment.receivedAmount) : ''}
						</td>
						<td class="p-2 border-r border-black font-bold text-sm">
							{installment.pendingAmount > 0 ? formatCurrency(installment.pendingAmount) : '0'}
						</td>
						<td class="p-2 border-r border-black font-bold text-sm whitespace-nowrap">
							<div class="flex items-center justify-center gap-2">
								<span>{formatDateShort(installment.paymentDate || installment.dueDate)}</span>
								<!-- Screen only: Pay button next to date if not paid so logic is contained -->
								{#if installment.status !== 'PAID'}
									<button 
										onclick={() => {
											selectedInstallment = installment;
											paymentAmount = parseFloat(installment.pendingAmount);
										}}
										class="print:hidden px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold shadow-sm hover:bg-gray-700 transition"
									>
										PAY
									</button>
								{:else}
									<CheckCircle2 class="print:hidden w-3.5 h-3.5 text-gray-400" />
								{/if}
							</div>
						</td>
						<td class="p-2 font-bold text-sm"></td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr class="border-t-2 border-black font-bold">
					<td colspan="3" class="p-3 text-right border-r-2 border-black text-sm uppercase">Total Balnce</td>
					<td class="p-3 border-r-2 border-black text-sm">{formatCurrency(totalInstallmentSum)}</td>
					<td class="p-3 border-r-2 border-black text-sm">{formatCurrency(totalReceivedSum)}</td>
					<td class="p-3 border-r-2 border-black text-sm">{formatCurrency(totalPendingSum)}</td>
					<td class="p-3 border-r-2 border-black"></td>
					<td class="p-3"></td>
				</tr>
			</tfoot>
		</table>
	</div>
</div>

<!-- Payment Modal -->
{#if selectedInstallment}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl border border-gray-200 overflow-hidden transform transition-all">
			<div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
				<div>
					<h2 class="text-lg font-black text-gray-900 leading-none">Record Payment</h2>
					<p class="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-wider">Installment #{selectedInstallment.serialNumber}</p>
				</div>
				<button 
					onclick={() => selectedInstallment = null}
					class="p-2 rounded-full hover:bg-gray-200 text-gray-400 transition-colors"
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
				
				<div class="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-inner">
					<div class="space-y-1">
						<p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly Due</p>
						<p class="text-lg font-black text-gray-900">{formatCurrency(selectedInstallment.amount)}</p>
					</div>
					<div class="text-right space-y-1">
						<p class="text-[10px] font-black text-red-500 uppercase tracking-widest">Remaining</p>
						<p class="text-lg font-black text-red-600">{formatCurrency(selectedInstallment.pendingAmount)}</p>
					</div>
				</div>

				<div class="space-y-2">
					<label for="amount" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Amount (Rs)</label>
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
							class="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all text-gray-900 font-bold text-lg" 
						/>
					</div>
				</div>

				<div class="space-y-2">
					<label for="method" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Method</label>
					<select 
						name="method" 
						id="method"
						class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer text-sm"
					>
						<option value="CASH">Cash in Hand</option>
						<option value="BANK">Bank Transfer</option>
						<option value="CHEQUE">Cheque</option>
						<option value="E-PAISA">EasyPaisa / JazzCash</option>
					</select>
				</div>

				<div class="pt-2">
					<button 
						type="submit"
						class="w-full py-3.5 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-md hover:bg-black transition-all text-xs"
					>
						Confirm Payment
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Use precise borders for the card on screen simulating a document */
	.receipt-card {
		border: 2px solid #000;
		color: #000;
	}
	
	/* Strip Tailwind dark colors, force exactly black and white when printed */
	@media print {
		@page {
			margin: 1cm;
			size: A4 portrait;
		}
		:global(body) {
			background: white !important;
			margin: 0;
			padding: 0;
		}
		:global(aside), :global(header) {
			display: none !important;
		}
		:global(main) {
			padding: 0 !important;
			margin: 0 !important;
		}
		
		.receipt-card {
			box-shadow: none !important;
			margin: 0 !important;
			width: 100% !important;
			border: 2px solid #000 !important;
		}
		* {
			color: #000 !important;
		}
	}
</style>
