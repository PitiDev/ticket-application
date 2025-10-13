<template>
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md mx-auto">

            <!-- Banner Image -->
            <!-- <div class="mb-8 rounded-2xl overflow-hidden">
                <img src="https://scontent.fvte2-3.fna.fbcdn.net/v/t39.30808-6/475075257_122139352400462056_5019390404863694383_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=86c6b0&_nc_eui2=AeE5B2uIGSYShddspaU4pex3rmLGOnaYylKuYsY6dpjKUmdzLrXzim7eTbyGEPE_XPv8-wbV-FXsf6oOrgB7H8bW&_nc_ohc=-lCyP40yQE4Q7kNvwEaekRk&_nc_oc=AdkBXEntIvTHFPRPHeb5Dy3YNAfNwr4XM2SlfbDgm1IEfztPe-kEIJO35MSeg1unLIc&_nc_zt=23&_nc_ht=scontent.fvte2-3.fna&_nc_gid=frSCSyzrQ80sSVpDAogMvA&oh=00_Afb0cGozgW05tEz9fngYsPrBVml48hZwSrjxumq_W7K2NQ&oe=68E24D75" alt="ປ້າຍໂຄສະນາງານ LBB PLUS" class="w-full h-auto object-cover"
                    style="max-width: 820px; margin: 0 auto; display: block;" />
            </div> -->

            <!-- Header -->
            <div class="text-center mb-8">
                <div
                    class="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    ລົງທະບຽນງານ LBB PLUS
                </h1>
                <p class="text-gray-600">
                    ລົງທະບຽນສຳລັບງານດາວໂຫລດແອັບ LBB PLUS
                </p>
            </div>

            <!-- Registration Form -->
            <div class="bg-white rounded-2xl shadow-xl p-8">
                <form @submit.prevent="handleSubmit">
                    <!-- Ticket ID -->
                    <div class="mb-6">
                        <label for="ticket_id" class="block text-sm font-semibold text-gray-700 mb-2">
                            ເລກບັດ <span class="text-red-600">*</span>
                        </label>
                        <input v-model="formData.ticket_id" type="text" id="ticket_id"
                            placeholder="ຕົວຢ່າງ: TK001 ຫຼື TICKET12345" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition" />
                        <p class="text-xs text-gray-500 mt-1">ກະລຸນາໃສ່ເລກບັດຂອງທ່ານ</p>
                    </div>

                    <!-- Full Name -->
                    <div class="mb-6">
                        <label for="fullname" class="block text-sm font-semibold text-gray-700 mb-2">
                            ຊື່ ແລະ ນາມສະກຸນ <span class="text-red-600">*</span>
                        </label>
                        <input v-model="formData.fullname" type="text" id="fullname"
                            placeholder="ກະລຸນາໃສ່ຊື່ ແລະ ນາມສະກຸນຂອງທ່ານ" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition" />
                    </div>

                    <!-- Phone -->
                    <div class="mb-6">
                        <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                            ເບີໂທລະສັບ <span class="text-red-600">*</span>
                        </label>
                        <input v-model="formData.phone" type="tel" id="phone" placeholder="ຕົວຢ່າງ: 2055551234" required
                            pattern="[0-9]+"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition" />
                        <p class="text-xs text-gray-500 mt-1">ໃສ່ພຽງແຕ່ຕົວເລກເທົ່ານັ້ນ, ບໍ່ມີຊ່ອງຫວ່າງ ຫຼື ຂີດກັ້ນ</p>
                    </div>

                    <!-- Success Message with Download Links -->
                    <div v-if="successMessage"
                        class="mb-6 p-6 bg-gradient-to-r from-red-50 to-amber-50 border-l-4 border-red-600 rounded-r-lg animate-fade-in shadow-md">
                        <div class="flex items-start mb-4">
                            <svg class="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <div class="flex-1">
                                <p class="text-red-900 font-bold text-lg">{{ successMessage }}</p>
                                <div v-if="registrationData" class="mt-3 space-y-1">
                                    <p class="text-gray-700 text-sm">
                                        <span class="font-medium">ເລກບັດ:</span> {{ registrationData.ticket_id }}
                                    </p>
                                    <p class="text-gray-700 text-sm">
                                        <span class="font-medium">ງານ:</span> {{ registrationData.event }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Download App Section -->
                        <div class="mt-4 pt-4 border-t border-amber-200">
                            <p class="text-gray-900 font-semibold mb-3 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                                ດາວໂຫລດແອັບ LBB PLUS ດຽວນີ້!
                            </p>

                            <div class="grid grid-cols-2 gap-3">
                                <!-- iOS Download Button -->
                                <a href="https://apps.apple.com/us/app/lbb-plus/id6744352117" target="_blank"
                                    class="flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-md hover:shadow-lg">
                                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    <div class="text-left">
                                        <div class="text-[10px] leading-tight">ດາວໂຫລດຈາກ</div>
                                        <div class="text-sm font-semibold leading-tight">App Store</div>
                                    </div>
                                </a>

                                <!-- Android Download Button -->
                                <a href="https://play.google.com/store/apps/details?id=com.laobullionbank.app&hl=en"
                                    target="_blank"
                                    class="flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-md hover:shadow-lg">
                                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path
                                            d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                    </svg>
                                    <div class="text-left">
                                        <div class="text-[10px] leading-tight">ດາວໂຫລດຈາກ</div>
                                        <div class="text-sm font-semibold leading-tight">Google Play</div>
                                    </div>
                                </a>
                            </div>

                            <p class="text-xs text-gray-600 mt-3 text-center">
                                {{ autoDownloadMessage }}
                            </p>
                        </div>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage"
                        class="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg animate-fade-in">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd" />
                            </svg>
                            <p class="text-red-900 flex-1 font-semibold">{{ errorMessage }}</p>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex gap-3">
                        <button type="submit" :disabled="loading"
                            class="flex-1 bg-gradient-to-r from-red-600 to-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                            <span v-if="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                ກຳລັງລົງທະບຽນ...
                            </span>
                            <span v-else>ລົງທະບຽນດຽວນີ້</span>
                        </button>

                        <button type="button" @click="resetForm" :disabled="loading"
                            class="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
                            ລ້າງຟອມ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

definePageMeta({
    layout: 'empty',
});

// API Base URL
const config = useRuntimeConfig();
const apiBase = 'http://localhost:9000/api';

// Form Data (only 3 fields)
const formData = reactive({
    ticket_id: '',
    fullname: '',
    phone: ''
});

// State
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const registrationData = ref(null);
const autoDownloadMessage = ref('');

// Detect device type
const detectDevice = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }

    // Android detection
    if (/android/i.test(userAgent)) {
        return 'android';
    }

    return 'desktop';
};

// Auto open app store based on device
const autoOpenAppStore = () => {
    const device = detectDevice();

    if (device === 'ios') {
        autoDownloadMessage.value = '📱 ກຳລັງເປີດ App Store ສຳລັບ iOS...';
        setTimeout(() => {
            window.open('https://apps.apple.com/us/app/lbb-plus/id6744352117', '_blank');
        }, 1000);
    } else if (device === 'android') {
        autoDownloadMessage.value = '📱 ກຳລັງເປີດ Google Play Store ສຳລັບ Android...';
        setTimeout(() => {
            window.open('https://play.google.com/store/apps/details?id=com.laobullionbank.app&hl=en', '_blank');
        }, 1000);
    } else {
        autoDownloadMessage.value = '💻 ກະລຸນາເລືອກແພລດຟອມອຸປະກອນຂອງທ່ານຂ້າງເທິງເພື່ອດາວໂຫລດ';
    }
};

// Load recent registrations on mount
onMounted(() => {
    // Optional: load recent registrations
});

// Handle form submission
const handleSubmit = async () => {
    loading.value = true;
    successMessage.value = '';
    errorMessage.value = '';
    registrationData.value = null;
    autoDownloadMessage.value = '';

    try {
        const response = await fetch(`${apiBase}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ticket_id: formData.ticket_id,
                fullname: formData.fullname,
                phone: parseInt(formData.phone)
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            successMessage.value = 'ລົງທະບຽນສຳເລັດ! ຂອບໃຈທີ່ລົງທະບຽນ';
            registrationData.value = data.data;

            // Auto open app store based on device
            autoOpenAppStore();

            // Reset form
            resetForm();

            // Clear success message after 30 seconds
            setTimeout(() => {
                successMessage.value = '';
                registrationData.value = null;
                autoDownloadMessage.value = '';
            }, 30000);
        } else {
            errorMessage.value = data.message || 'ລົງທະບຽນບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.value = 'ເກີດຂໍ້ຜິດພາດເຄືອຂ່າຍ. ກະລຸນາກວດເບິ່ງການເຊື່ອມຕໍ່ຂອງທ່ານ ແລະ ລອງໃໝ່ອີກຄັ້ງ';
    } finally {
        loading.value = false;
    }
};

// Reset form
const resetForm = () => {
    formData.ticket_id = '';
    formData.fullname = '';
    formData.phone = '';
    errorMessage.value = '';
};
</script>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out;
}
</style>