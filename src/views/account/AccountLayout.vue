<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { useUi } from '@/stores/ui'
import { useSeo } from '@/composables/useSeo'
useSeo({ title: 'Mi cuenta', noindex: true })
const auth = useAuth(), ui = useUi(), router = useRouter()
const links = [
  { to: '/cuenta', icon: 'mdi-view-dashboard-outline', t: 'Resumen', exact: true },
  { to: '/cuenta/pedidos', icon: 'mdi-package-variant-closed', t: 'Mis pedidos' },
  { to: '/cuenta/favoritos', icon: 'mdi-heart-outline', t: 'Favoritos' },
  { to: '/cuenta/perfil', icon: 'mdi-account-cog-outline', t: 'Perfil y direcciones' }
]
function logout() { auth.logout(); router.push('/'); ui.notify('Sesión cerrada', 'info') }
</script>

<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="3">
        <v-card border class="pa-4 sticky">
          <div class="d-flex align-center ga-3 mb-3"><v-avatar color="primary" size="48"><span class="font-weight-bold">{{ auth.initials }}</span></v-avatar><div class="text-truncate"><div class="font-weight-bold text-truncate">{{ auth.user.name }}</div><div class="text-caption text-medium-emphasis text-truncate">{{ auth.user.email }}</div></div></div>
          <v-list nav density="comfortable" class="d-none d-md-block pa-0">
            <v-list-item v-for="l in links" :key="l.to" :to="l.to" :exact="l.exact" :prepend-icon="l.icon" :title="l.t" rounded="lg" color="primary" />
            <v-divider class="my-2" />
            <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" rounded="lg" @click="logout" />
          </v-list>
          <v-tabs class="d-md-none" show-arrows color="primary"><v-tab v-for="l in links" :key="l.to" :to="l.to" :exact="l.exact" :prepend-icon="l.icon">{{ l.t }}</v-tab></v-tabs>
        </v-card>
      </v-col>
      <v-col cols="12" md="9"><router-view /></v-col>
    </v-row>
  </v-container>
</template>

<style scoped>.sticky { position: sticky; top: 88px; }</style>
