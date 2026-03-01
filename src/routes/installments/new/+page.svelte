<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		ArrowLeft, 
		User, 
		Package, 
		Calendar, 
		Clock, 
		DollarSign, 
		Info, 
		AlertCircle,
		CheckCircle2,
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	let selectedCustomerId = $state('');
	let selectedProductId = $state('');
	let startDate = $state(new Date().toISOString().split('T')[0]);
	let customDuration = $state(0);
	let customDownPayment = $state(0);

	const selectedProduct = $derived(data.products.find((p: any) => p.id === selectedProductId));
	const selectedCustomer = $derived(data.customers.find((c: any) => c.id === selectedCustomerId));

	const duration = $derived(customDuration || (selectedProduct?.durationMonths ?? 12));
	const totalAmount = $derived(selectedProduct ? parseFloat(selectedProduct.installmentPrice) : 0);
	const downPayment = $derived(customDownPayment || (selectedProduct ? parseFloat(selectedProduct.downPayment) : 0));
	const remainingBalance = $derived(totalAmount - downPayment);
	const monthlyAmount = $derived(duration > 0 ? remainingBalance / duration : 0);

	// Generate preview schedule
	const schedulePreview = $derived.by(() => {
		if (!selectedProduct || !startDate) return [];
		const schedule = [];
		const start = new Date(startDate);
		for (let i = 1; i <= Math.min(duration, 12); i++) {
			const dueDate = new Date(start);
			dueDate.setMonth(dueDate.getMonth() + i);
			schedule.push({
				serial: i,
				date: dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
				amount: monthlyAmount
			});
		}
		return schedule;
	});

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
	}
</script>

<div class="max-w-5xl mx-auto space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a href="/installments" class="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none">Create New Sale</h1>
				<p class="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest leading-none">Installment Plan Configurator</p>
			</div>
		</div>
	</div>

	<form method="POST" use:enhance class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Left: Selection & Options -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Customer Selection -->
			<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
				<div class="flex items-center gap-2 text-slate-400 mb-6 self-start">
					<User class="w-4 h-4" />
					<span class="text-[10px] font-black uppercase tracking-widest">Step 1: Select Customer</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					<div class="space-y-4">
						<label for="customerId" class="text-lg font-black text-slate-800 ml-1">Choose Customer</label>
						<select 
							name="customerId" 
							id="customerId" 
							bind:value={selectedCustomerId}
							required 
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold appearance-none cursor-pointer h-16"
						>
							<option value="">Select a customer...</option>
							{#each data.customers as customer}
								<option value={customer.id}>{customer.name} - {customer.cnic}</option>
							{/each}
						</select>
					</div>
					{#if selectedCustomer}
						<div class="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/30 flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
							<div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-100/50 shrink-0">
								{selectedCustomer.name.substring(0, 2).toUpperCase()}
							</div>
							<div class="space-y-1 overflow-hidden">
								<p class="font-black text-slate-800 truncate">{selectedCustomer.name}</p>
								<p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedCustomer.mobile}</p>
								<p class="text-[10px] text-slate-400 font-bold truncate">{selectedCustomer.address}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Product Selection -->
			<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
				<div class="flex items-center gap-2 text-slate-400 mb-6 self-start">
					<Package class="w-4 h-4" />
					<span class="text-[10px] font-black uppercase tracking-widest">Step 2: Select Product</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					<div class="space-y-4">
						<label for="productId" class="text-lg font-black text-slate-800 ml-1">Choose Product</label>
						<select 
							name="productId" 
							id="productId" 
							bind:value={selectedProductId}
							required 
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold appearance-none cursor-pointer h-16"
						>
							<option value="">Select a product...</option>
							{#each data.products as product}
								<option value={product.id}>{product.name} ({product.category})</option>
							{/each}
						</select>
					</div>
					{#if selectedProduct}
						<div class="grid grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-left-4">
							<div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
								<p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Installment Price</p>
								<p class="text-md font-black text-slate-800 mt-1">{formatCurrency(selectedProduct.installmentPrice)}</p>
							</div>
							<div class="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/30">
								<p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Profit</p>
								<p class="text-md font-black text-emerald-600 mt-1">{formatCurrency(selectedProduct.profit)}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Plan Configuration -->
			<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
				<div class="flex items-center gap-2 text-slate-400 mb-6 self-start">
					<Clock class="w-4 h-4" />
					<span class="text-[10px] font-black uppercase tracking-widest">Step 3: Plan Setup</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
					<div class="space-y-4">
						<label for="startDate" class="text-sm font-black text-slate-800 ml-1 uppercase tracking-widest">Agreement Date</label>
						<input 
							type="date" 
							name="startDate" 
							id="startDate" 
							bind:value={startDate}
							required 
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold h-16" 
						/>
					</div>
					<div class="space-y-4">
						<label for="durationMonths" class="text-sm font-black text-slate-800 ml-1 uppercase tracking-widest">Duration (Months)</label>
						<input 
							type="number" 
							name="durationMonths" 
							id="durationMonths" 
							bind:value={customDuration}
							placeholder={selectedProduct?.durationMonths?.toString() ?? "12"}
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold h-16" 
						/>
					</div>
					<div class="space-y-4">
						<label for="downPayment" class="text-sm font-black text-slate-800 ml-1 uppercase tracking-widest">Down Payment</label>
						<input 
							type="number" 
							name="downPayment" 
							id="downPayment" 
							bind:value={customDownPayment}
							placeholder={selectedProduct?.downPayment?.toString() ?? "0"}
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold h-16" 
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Summary & Preview -->
		<div class="space-y-8">
			<div class="bg-blue-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-blue-200 sticky top-28">
				<h3 class="text-xl font-black mb-8 border-b border-blue-500/50 pb-4">Sale Summary</h3>
				
				<div class="space-y-6">
					<div class="flex justify-between items-center bg-blue-700/30 p-4 rounded-2xl border border-blue-500/20">
						<span class="text-xs font-bold text-blue-200 uppercase tracking-widest">Installment Total</span>
						<span class="text-xl font-black">{formatCurrency(totalAmount)}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-xs font-bold text-blue-200 uppercase tracking-widest">Down Payment</span>
						<span class="text-md font-black">-{formatCurrency(downPayment)}</span>
					</div>
					<div class="flex justify-between items-center border-t border-blue-500/50 pt-6">
						<span class="text-xs font-bold text-blue-200 uppercase tracking-widest">Balance to Pay</span>
						<span class="text-2xl font-black">{formatCurrency(remainingBalance)}</span>
					</div>
					<div class="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-8 text-center">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">Monthly Installment</p>
						<p class="text-3xl font-black">{formatCurrency(monthlyAmount)}</p>
						<p class="text-[10px] font-bold text-blue-100 mt-2 italic">For {duration} months</p>
					</div>
				</div>

				<button 
					type="submit"
					class="w-full mt-10 py-5 bg-white text-blue-600 font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-xs"
				>
					Generate Plan & Sale
				</button>
			</div>

			<!-- Schedule Preview -->
			{#if schedulePreview.length > 0}
				<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
					<h3 class="text-sm font-black text-slate-800 uppercase tracking-[0.1em] mb-6 flex items-center gap-2">
						<Calendar class="w-4 h-4 text-blue-500" />
						First {schedulePreview.length} Installments
					</h3>
					<div class="space-y-4">
						{#each schedulePreview as item}
							<div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-colors">
								<div>
									<p class="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Month {item.serial}</p>
									<p class="text-xs font-bold text-slate-700">{item.date}</p>
								</div>
								<span class="text-xs font-black text-blue-600">{formatCurrency(item.amount)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</form>
</div>
