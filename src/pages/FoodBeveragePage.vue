<template>
  <div class="thrift-page q-pa-lg">
    <h1 class="text-h2 q-mb-md text-center">Food & Beverages</h1>
    <p class="text-h5 text-center">Welcome to our F&B section.</p>

    <q-carousel
      v-model="slide"
      animated
      arrows
      navigation
      infinite
      height="400px"
      class="q-mb-lg rounded"
    >
      <q-carousel-slide name="1" img-src="/icons/f&b_3.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-white text-bold">Freshly Made Every Day</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="2" img-src="/icons/f&b_4.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-white-9 text-bold">Aunthentic</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="3" img-src="/icons/f&b_5.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-black text-bold">Variety Cuisine</div>
          </div>
        </template>
      </q-carousel-slide>

      <q-carousel-slide name="4" img-src="/icons/f&b_6.jpg">
        <template #default>
          <div class="absolute-center text-center q-pa-md">
            <div class="text-h3 text-white text-bold">Sweet as Your Smile</div>
          </div>
        </template>
      </q-carousel-slide>
    </q-carousel>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Nasi Goreng Ayam Kunyit</div>
            <q-img src="/icons/f&b_1.jpg" alt="Nasi Goreng Ayam Kunyit" class="q-mt-md rounded" />
            <p class="q-mt-sm text-h6">
              Hanya RM7.00 dan boleh dihantar dari bilik ke bilik tanpa cas penghantaran
            </p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Takoyaki</div>
            <q-img src="/icons/f&b_2.jpg" alt="Takoyaki" class="q-mt-md rounded" />
            <p class="q-mt-sm text-h6">6pcs-RM5 13pcs-RM10</p>
            <p class="q-mt-sm text-h6">Promosi: Beli 13pcs, dapat 2pcs percuma</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">Ramen Korea</div>
            <q-img src="/icons/f&b_7.jpg" alt="Ramen (samyang)" class="q-mt-md rounded" />
            <p class="q-mt-sm text-h6">🍜 Rabokki (Tteokbokki Flavour) 💰 RM4m</p>
            <p class="q-mt-sm text-h6">🌶️ Buldak Original (Spicy Ramen) 💰 RM6</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="thrift-card">
          <q-card-section>
            <div class="text-h6">WOW Spagheti</div>
            <q-img src="/icons/f&b_8.jpg" alt="WOW Spagheti" class="q-mt-md rounded" />
            <p class="q-mt-sm text-h6">Harga: RM3, RM5(2)</p>
            <p class="q-mt-sm text-h6">Buy 2, get 1 free WOW Carbonara</p>
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
