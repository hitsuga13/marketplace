<template>
  <div class="thrift-page q-pa-lg">
    <h1 class="text-h2 q-mb-md text-center">Thrift Store</h1>
    <p class="text-h5 text-center">Welcome to our thrift section.</p>

    <q-carousel
      v-model="slide"
      animated
      arrows
      navigation
      infinite
      height="400px"
      class="q-mb-lg rounded"
    >
      <q-carousel-slide name="1" img-src="/icons/thrift_1.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-black text-bold">Premium Thrift Collection</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="2" img-src="/icons/thrift_2.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-blue-9 text-bold">Streetwear Finds</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="3" img-src="/icons/thrift_3.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-yellow-10 text-bold">Sustainable Fashion</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="4" img-src="/icons/thrift_4.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-white text-bold">Thrifted Luxury</div>
          </div>
        </template>
      </q-carousel-slide>
    </q-carousel>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Rebelutions Tour shirt</div>
            <q-img src="/icons/item_1.jpg" alt="Thrift Item 1" class="q-mt-md rounded" />
            <p class="q-mt-sm">Description of thrift item</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Hoodie</div>
            <q-img src="/icons/thrift_5.jpg" alt="Thrift Item 2" class="q-mt-md rounded" />
            <p class="q-mt-sm">Description of thrift item</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Brazil National Team Jersey</div>
            <q-img src="/icons/item_2.jpg" alt="Thrift Item 2" class="q-mt-md rounded" />
            <p class="q-mt-sm">Description of thrift item</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Nike SB Dunk</div>
            <q-img src="/icons/item_3.jpg" alt="Thrift Item 2" class="q-mt-md rounded" />
            <p class="q-mt-sm">Description of thrift item</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Snapback New Era</div>
            <q-img src="/icons/thrift_6.jpg" alt="Snapback New Era" class="q-mt-md rounded" />
            <p class="q-mt-sm">Description of thrift item</p>
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
