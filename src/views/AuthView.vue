<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'
import { useUi } from '@/stores/ui'
import { useSeo } from '@/composables/useSeo'

const props = defineProps({ mode: { type: String, default: 'login' } })
const auth = useAuth(), ui = useUi(), route = useRoute(), router = useRouter()
useSeo(() => ({ title: props.mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta', noindex: true }))
const isLogin = computed(() => props.mode === 'login')
const f = ref({ name: '', email: '', password: '' })
const show = ref(false), busy = ref(false), error = ref('')
const formRef = ref(null)
const rules = { email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') || 'Email no válido'], pass: [(v) => (v || '').length >= 8 || 'Mínimo 8 caracteres'], name: [(v) => !!(v || '').trim() || 'Nombre obligatorio'] }

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  busy.value = true; error.value = ''
  try {
    if (isLogin.value) await auth.login(f.value.email, f.value.password)
    else await auth.register(f.value.name, f.value.email, f.value.password)
    ui.notify(isLogin.value ? `¡Hola de nuevo, ${auth.user.name.split(' ')[0]}!` : '¡Cuenta creada!')
    router.replace(String(route.query.next || '/cuenta'))
  } catch (e) { error.value = e.message }
  busy.value = false
}
async function demo() { f.value = { name: '', email: 'demo@chronos.com', password: 'demo1234' }; await nextTick(); submit() }
</script>

<template>
  <div class="wall auth-wrap">
    <v-container class="d-flex justify-center py-10">
      <v-card border class="pa-6 pa-sm-8 w-100" max-width="460">
        <h1 class="serif text-h4 mb-1">{{ isLogin ? 'Bienvenido' : 'Crea tu cuenta' }}</h1>
        <p class="text-medium-emphasis mb-5">{{ isLogin ? 'Accede para ver tus pedidos y seguirlos en tiempo real.' : 'Guarda favoritos, direcciones y sigue tus pedidos.' }}</p>
        <v-form ref="formRef" @submit.prevent="submit">
          <v-text-field v-if="!isLogin" v-model="f.name" label="Nombre" :rules="rules.name" autocomplete="name" prepend-inner-icon="mdi-account-outline" />
          <v-text-field v-model="f.email" label="Email" type="email" :rules="rules.email" autocomplete="email" prepend-inner-icon="mdi-email-outline" />
          <v-text-field v-model="f.password" label="Contraseña" :type="show ? 'text' : 'password'" :rules="isLogin ? [] : rules.pass" :autocomplete="isLogin ? 'current-password' : 'new-password'" prepend-inner-icon="mdi-lock-outline" :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="show = !show" />
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3">{{ error }}</v-alert>
          <v-btn type="submit" color="primary" size="large" block :loading="busy">{{ isLogin ? 'Entrar' : 'Crear cuenta' }}</v-btn>
        </v-form>
        <v-btn v-if="isLogin" variant="tonal" block class="mt-3" prepend-icon="mdi-flash-outline" @click="demo">Entrar con cuenta demo</v-btn>
        <p class="text-body-2 text-center mt-5">
          <template v-if="isLogin">¿No tienes cuenta? <router-link :to="{ path: '/registro', query: route.query }">Regístrate</router-link></template>
          <template v-else>¿Ya tienes cuenta? <router-link :to="{ path: '/login', query: route.query }">Inicia sesión</router-link></template>
        </p>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>.auth-wrap { min-height: calc(100vh - 100px); }</style>
