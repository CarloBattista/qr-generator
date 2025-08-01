<template>
  <Notivue v-slot="item">
    <Notification :item="item" :theme="pastelTheme" :icons="outlinedIcons" />
  </Notivue>
  <div>
    <RouterView :APP_TESTING="APP_TESTING" v-if="!loading && false" @load-profile="getProfile" @load-qr-codes="getQrCodes" />
    <div v-if="!loading" class="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-xl px-6">
        <div class="w-full mb-8 flex items-center justify-center">
          <appLogo class="relative max-w-30" />
        </div>
        <div class="w-full flex items-center justify-center text-center">
          <h1 class="text-black text-3xl font-semibold">Al momento Qrea è in fase di sviluppo</h1>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="fixed z-[99999999] top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-full flex items-center justify-center">
      <loader />
    </div>
  </div>
</template>

<script>
import { supabase } from './lib/supabase';
import { auth } from './data/auth';
import { store } from './data/store';
import { syncLocaleWithProfile } from './lib/i18n';
import { Notivue, Notification } from 'notivue';

import appLogo from './components/global/app-logo.vue';
import loader from './components/loader/loader.vue';

export default {
  name: 'App',
  components: {
    appLogo,
    loader,

    Notivue,
    Notification,
  },
  data() {
    return {
      auth,
      store,

      loading: true,

      APP_TESTING: import.meta.env.VITE_APP,
    };
  },
  computed: {
    qrLimit() {
      return this.auth.profile?.plan === 'pro' ? this.store.planConfig.pro_plan_limit_create_qr : this.store.planConfig.free_plan_limit_create_qr;
    },
    currentQrCount() {
      if (!this.store.qrCodes.data) {
        return 0;
      }
      return this.store.qrCodes.data.length;
    },
    canCreateQR() {
      return this.currentQrCount < this.qrLimit;
    },
  },
  methods: {
    async getUser() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (!error) {
          // console.log(data);

          this.auth.user = data.user;
          this.auth.isAuthenticated = true;

          localStorage.setItem('isAuthenticated', true);

          this.getSession();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!error) {
          // console.log(data);
          this.auth.session = data.session;
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getProfile() {
      if (!this.auth.user?.id) {
        return;
      }

      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('uid', this.auth.user.id).maybeSingle();

        if (!error) {
          // console.log(data);
          this.auth.profile = data;
          syncLocaleWithProfile();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async noUser() {
      try {
        const { error } = await supabase.auth.signOut();

        if (!error) {
          this.auth.user = null;
          this.auth.session = null;
          this.auth.profile = null;
          this.auth.isAuthenticated = false;
          localStorage.removeItem('isAuthenticated');

          this.$router.push({ name: 'signin' });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async sencStripeCustomer() {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

      if (!this.auth.profile || !this.auth.profile.stripe_id) {
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/stripe-customer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.auth.user.email,
            stripeId: this.auth.profile.stripe_id,
          }),
        });

        const data = await res.json();

        if (data.ok) {
          return { success: true, data };
        } else {
          return { success: false, error: data.error };
        }
      } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
      }
    },

    async getQrCodes() {
      this.store.qrCodes.loading = true;

      const PID = this.auth.profile.id;

      if (!PID) {
        this.store.qrCodes.loading = false;
        return;
      }

      try {
        const { data, error } = await supabase.from('qr_codes').select('*').eq('pid', PID);

        if (!error) {
          this.store.qrCodes.data = data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.store.qrCodes.loading = false;
      }
    },
  },
  watch: {
    'auth.user': {
      handler(value) {
        if (value) {
          this.getSession();
          this.getProfile();
        }
      },
      deep: true,
    },
    'auth.profile': {
      handler(value) {
        if (value) {
          this.getQrCodes();
          this.sencStripeCustomer();
        }
      },
      deep: true,
    },
    canCreateQR: {
      handler(value) {
        this.store.planConfig.can_create_qr = value;
      },
      immediate: true,
    },
    qrLimit: {
      handler(value) {
        this.store.planConfig.qr_limit = value;
      },
      immediate: true,
    },
  },
  async mounted() {
    if (document.readyState === 'complete') {
      this.loading = false;
    } else {
      window.addEventListener('load', () => {
        this.loading = false;
      });
    }

    window.scrollTo(0, 0);

    await this.getUser();

    if (this.auth.profile) {
      await this.getQrCodes();
      await this.sencStripeCustomer();
    }
  },
};
</script>

<style scoped></style>
