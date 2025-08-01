import { createRouter, createWebHistory } from 'vue-router';

// OnBoard
import Signup from '../views/onBoard/Signup.vue';
import Signin from '../views/onBoard/Signin.vue';
import Pricing from '../views/onBoard/Pricing.vue';
import Success from '../views/onBoard/Success.vue';
import Cancel from '../views/onBoard/Cancel.vue';

// Forgot
import ForgotPassword from '../views/Forgot/Forgot-password.vue';
import ResetPassword from '../views/Forgot/Reset-password.vue';

// Profile
import Profile from '../views/Profile.vue';

// General
import LandingPage from '../views/Landing-page.vue';
import Home from '../views/Home.vue';
import NewQr from '../views/New-qr.vue';
import EditQr from '../views/Edit-qr.vue';

// Help
import Contact from '../views/Help/Contact.vue';

// Common
import Privacy from '../views/Common/Privacy.vue';
import Terms from '../views/Common/Terms.vue';

// Error
import NotFound from '../views/Error/Not-found.vue';

const routes = [
  // OnBoard
  {
    path: '/signup',
    name: 'signup',
    component: Signup,
    props: true,
    meta: { title: 'Qrea • Registrati', requiresGuest: true },
  },
  {
    path: '/signin',
    name: 'signin',
    component: Signin,
    props: true,
    meta: { title: 'Qrea • Accedi', requiresGuest: true },
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: Pricing,
    props: true,
    meta: { title: 'Qrea • Prezzi' },
  },
  {
    path: '/success',
    name: 'success',
    component: Success,
    props: true,
    meta: { title: 'Qrea', requiresAuth: true },
  },
  {
    path: '/cancel',
    name: 'cancel',
    component: Cancel,
    props: true,
    meta: { title: 'Qrea', requiresAuth: true },
  },

  // Forgot
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    props: true,
    meta: { title: 'Qrea', requiresGuest: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPassword,
    props: true,
    meta: { title: 'Qrea', requiresGuest: true },
  },

  // Profile
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    props: true,
    meta: { title: 'Qrea • Profile', requiresAuth: true },
  },

  // General
  {
    path: '/',
    name: 'landing-page',
    component: LandingPage,
    props: true,
    meta: { title: 'Qrea' },
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    props: true,
    meta: { title: 'Qrea', requiresAuth: true },
  },
  {
    path: '/new-qr',
    name: 'new-qr',
    component: NewQr,
    props: true,
    meta: { title: 'Qrea • Crea un nuovo QR', requiresAuth: true },
  },
  {
    path: '/edit-qr/:id',
    name: 'edit-qr',
    component: EditQr,
    props: true,
    meta: { title: 'Qrea • Modifica QR', requiresAuth: true },
  },

  // Help
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
    props: true,
    meta: { title: 'Qrea • Contact' },
  },

  // Common
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: Privacy,
    props: true,
    meta: { title: 'Qrea • Privacy Policy' },
  },
  {
    path: '/terms-and-conditions',
    name: 'terms-and-conditions',
    component: Terms,
    props: true,
    meta: { title: 'Qrea • Privacy Policy' },
  },

  // Error
  {
    path: '/not-found',
    name: 'not-found',
    component: NotFound,
    props: true,
    meta: { title: 'Qrea' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const pageTitle = to.meta.title;
  if (pageTitle) {
    document.title = pageTitle;
  } else {
    document.title = 'Qrea';
  }

  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const authIsParsed = JSON.parse(isAuthenticated);

  if (to.meta.requiresGuest && authIsParsed) {
    next({ name: 'home' });
    return;
  }

  // Se la rotta richiede autenticazione e l'utente non è autenticato
  if (to.meta.requiresAuth && !authIsParsed) {
    next({ name: 'signin' });
    return;
  }

  next();
});

export default router;
