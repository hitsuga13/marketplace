<template>
  <div class="thrift-page q-pa-lg">
    <h1 class="text-h2 q-mb-md text-center">Services</h1>
    <p class="text-h5 text-center">Welcome to our Services section.</p>

    <q-carousel
      v-model="slide"
      animated
      arrows
      navigation
      infinite
      height="400px"
      class="q-mb-lg rounded"
    >
      <q-carousel-slide name="1" img-src="/icons/services_1.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-black text-bold">Top Tier Services</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="2" img-src="/icons/services_4.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-white text-bold">Reliable and Trusted</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="3" img-src="/icons/services_5.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-black text-bold">Fast and Efficient</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="4" img-src="/icons/services.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-white text-bold">Customer Satisfaction</div>
          </div>
        </template>
      </q-carousel-slide>
    </q-carousel>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Printing & Laminate</div>
            <q-img src="/icons/services_2.jpg" alt="Printing & Laminate" class="q-mt-md rounded" />
            <p class="q-mt-sm text-h6">*rujuk gambar untuk harga*</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Personal Runner</div>
            <q-img src="/icons/services_3.jpg" alt="Runner" class="q-mt-md rounded" />
            <p class="q-mt-sm text-h6">Small items (less than 1kg) - RM3 (per item)</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const slide = ref('1')
</script>

<style scoped>
.thrift-page {
  background-color: #e4d4dc;
  min-height: 100vh;
}

/* Fixed size for all cards */
.thrift-card {
  height: 500px; /* Change this value if you want different height */
  width: 100%;
  display: flex;
  flex-direction: column;
}

.thrift-card .q-img {
  height: 350px; /* Fixed image height */
  object-fit: cover;
  width: 100%;
}

.thrift-card .q-card-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.thrift-card p {
  margin-top: auto;
}
</style>
