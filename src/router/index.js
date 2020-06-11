import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

Vue.use(Router);

// Good guide: https://blog.sqreen.com/authentication-best-practices-vue/

const requireAutoJoinEnabled = (to, from, next) => {
  if (store.getters.GET_CONFIG.autoJoin) {
    next();
    return;
  }
  next('/');
};

// ==================== Router registration ====================
export default new Router({
  base: process.env.webroot,
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: () => import('../components/createroom.vue'),
      name: 'CreateRoom',
      meta: {
        requiresAuth: true,
        noAutoJoin: true,
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      meta: {},
      component: () => import('../components/signin.vue'),
    },
    {
      path: '/signout',
      component: () => import('../components/signout.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/autojoin',
      meta: {
        requiresAuth: true,
        redirectAfterAuth: true,
      },
      component: () => import('../components/autojoin.vue'),
      name: 'autojoin',
      beforeEnter: requireAutoJoinEnabled,
    },
    {
      path: '/join/:server/:room',
      meta: {
        requiresAuth: true,
        noAutoJoin: true,
        redirectAfterAuth: true,
      },
      component: () => import('../components/join.vue'),
      props: true,
      name: 'join',
    },
    {
      path: '/clientselect',
      component: () => import('../components/application/walkthrough.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/clientpicker',
      name: 'ClientPicker',
      component: () => import('../components/clientpicker.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/joinroom',
      component: () => import('../components/application/joinroom.vue'),
      meta: {
        requiresAuth: true,
        noAutoJoin: true,
      },
    },
    {
      path: '/player',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      component: () => import('../components/application/slplayer.vue'),
    },
    {
      path: '/nowplaying/:machineIdentifier/:ratingKey',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'nowplaying',
      component: () => import('../components/application/plexbrowser/plexcontent.vue'),
    },

    {
      path: '/browse',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'browse',
      component: () => import('../components/application/plexbrowser.vue'),
    },
    {
      path: '/browse/:machineIdentifier',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'server',
      component: () => import('../components/application/plexbrowser/plexserver.vue'),
    },
    {
      path: '/browse/:machineIdentifier/:sectionId',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'library',
      component: () => import('../components/application/plexbrowser/plexlibrary.vue'),
    },
    {
      path: '/browse/:machineIdentifier/:sectionId/:ratingKey',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'content',
      component: () => import('../components/application/plexbrowser/plexcontent.vue'),
    },
    {
      path: '/browse/:machineIdentifier/:sectionId/tv/:ratingKey',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'series',
      props: true,
      component: () => import('../components/application/plexbrowser/plexseries.vue'),
    },
    {
      path: '/browse/:machineIdentifier/:sectionId/tv/:parentKey/:ratingKey',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'season',
      props: true,
      component: () => import('../components/application/plexbrowser/plexseason.vue'),
    },
    {
      path:
        '/browse/:machineIdentifier/:sectionId/tv/:grandparentKey/:parentKey/:ratingKey',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'contentspecific',
      component: () => import('../components/application/plexbrowser/plexcontent.vue'),
    },
    {
      path:
        '/browse/:machineIdentifier/tv/:grandparentKey/:parentKey/:ratingKey',
      meta: {
        requiresAuth: true,
        protected: true,
      },
      name: 'contentnosection',
      component: () => import('../components/application/plexbrowser/plexcontent.vue'),
    },
  ],
});
