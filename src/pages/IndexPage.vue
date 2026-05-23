<template>
  <div class="q-pa-none">
    <q-parallax :height="600" :speed="0.7">
      <template v-slot:media>
        <img src="/icons/services.jpg" />
      </template>

      <h1 class="text-white">Services</h1>
    </q-parallax>
  </div>
  <div class="q-pa-none">
    <q-parallax :height="600" :speed="0.7">
      <template v-slot:media>
        <img src="/icons/f&b.jpg" />
      </template>

      <h1 class="text-white">Food & Beverage</h1>
    </q-parallax>
  </div>
  <div class="q-pa-none">
    <q-parallax :height="600" :speed="0.7">
      <template v-slot:media>
        <img src="/icons/thrift.jpg" />
      </template>

      <h1 class="text-white">Thrift Shop</h1>
    </q-parallax>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    return {
      slide: ref('style'),
      lorem:
        'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque voluptatem totam, architecto cupiditate officia rerum, error dignissimos praesentium libero ab nemo provident incidunt ducimus iusto perferendis porro earum. Totam, numquam?',
    }
  },
}
</script>
