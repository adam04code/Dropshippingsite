<script setup>
import { reactive, ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { useUi } from '@/stores/ui'

const auth = useAuth(), ui = useUi()
const a = auth.user.address || {}
const p = reactive({ name: auth.user.name, phone: auth.user.phone, line1: a.line1 || '', line2: a.line2 || '', city: a.city || '', zip: a.zip || '', province: a.province || '', country: a.country || 'España' })
const pw = reactive({ currentPassword: '', password: '' })
const busy = ref(false), busyPw = ref(false), errPw = ref('')
const req = (v) => !!String(v || '').trim() || 'Obligatorio'

async function save() {
  busy.value = true
  try { await auth.updateProfile({ name: p.name, phone: p.phone, address: { line1: p.line1, line2: p.line2, city: p.city, zip: p.zip, province: p.province, country: p.country } }); ui.notify('Perfil guardado') } catch (e) { ui.notify(e.message, 'error') }
  busy.value = false
}
async function changePw() {
  busyPw.value = true; errPw.value = ''
  try { await auth.updateProfile({ ...pw }); pw.currentPassword = pw.password = ''; ui.notify('Contraseña actualizada') } catch (e) { errPw.value = e.message }
  busyPw.value = false
}
</script>
<template>
  <div>
    <h1 class="serif text-h4 mb-4">Perfil y direcciones</h1>
    <v-card border class="pa-5 mb-4">
      <h2 class="text-h6 serif mb-3">Datos personales y dirección de envío</h2>
      <v-form @submit.prevent="save">
        <v-row dense>
          <v-col cols="12" sm="6"><v-text-field v-model="p.name" label="Nombre" :rules="[req]" /></v-col>
          <v-col cols="12" sm="6"><v-text-field v-model="p.phone" label="Teléfono" /></v-col>
          <v-col cols="12"><v-text-field v-model="p.line1" label="Dirección" /></v-col>
          <v-col cols="12"><v-text-field v-model="p.line2" label="Piso, puerta…" /></v-col>
          <v-col cols="6" sm="3"><v-text-field v-model="p.zip" label="C. postal" /></v-col>
          <v-col cols="6" sm="5"><v-text-field v-model="p.city" label="Ciudad" /></v-col>
          <v-col cols="12" sm="4"><v-text-field v-model="p.province" label="Provincia" /></v-col>
        </v-row>
        <v-btn type="submit" color="primary" :loading="busy">Guardar cambios</v-btn>
      </v-form>
    </v-card>
    <v-card border class="pa-5">
      <h2 class="text-h6 serif mb-3">Cambiar contraseña</h2>
      <v-form @submit.prevent="changePw">
        <v-row dense>
          <v-col cols="12" sm="6"><v-text-field v-model="pw.currentPassword" label="Contraseña actual" type="password" autocomplete="current-password" /></v-col>
          <v-col cols="12" sm="6"><v-text-field v-model="pw.password" label="Nueva contraseña" type="password" autocomplete="new-password" :rules="[(v) => (v || '').length >= 8 || 'Mínimo 8 caracteres']" /></v-col>
        </v-row>
        <v-alert v-if="errPw" type="error" variant="tonal" density="compact" class="mb-3">{{ errPw }}</v-alert>
        <v-btn type="submit" variant="tonal" :loading="busyPw" :disabled="!pw.currentPassword || pw.password.length < 8">Actualizar contraseña</v-btn>
      </v-form>
    </v-card>
  </div>
</template>
