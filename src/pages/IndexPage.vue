<template>
  <q-page class="home-page">
    <section class="hero-section">
      <div class="hero-media">
        <img src="/icons/f&b.jpg" alt="UPNM Marketplace featured food and campus items" />
      </div>

      <div class="hero-content">
        <q-badge color="secondary" text-color="dark" class="q-mb-md" label="Campus marketplace" />
        <h1>UPNM Marketplace</h1>
        <p>
          Discover student-run food, reliable campus services, and thrift finds around UPNM in one
          quick place.
        </p>

        <div class="row q-col-gutter-sm hero-actions">
          <div class="col-12 col-sm-auto">
            <q-btn
              unelevated
              color="secondary"
              text-color="dark"
              icon="restaurant_menu"
              label="Explore Food"
              to="/page2"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn outline color="white" icon="storefront" label="Browse All" to="/main" />
          </div>
        </div>
      </div>
    </section>

    <section class="category-band">
      <div class="page-shell">
        <div class="section-heading">
          <div>
            <q-badge color="primary" label="Quick browse" />
            <h2>What are you looking for today?</h2>
          </div>
          <p>Jump straight into the categories students actually use between classes.</p>
        </div>

        <div class="row q-col-gutter-lg">
          <div v-for="category in categories" :key="category.title" class="col-12 col-md-4">
            <q-card class="category-card" flat bordered>
              <q-img :src="category.image" :alt="category.title" ratio="4/3" />
              <q-card-section>
                <div class="row items-center no-wrap">
                  <q-icon :name="category.icon" color="primary" size="28px" class="q-mr-sm" />
                  <div class="text-h6">{{ category.title }}</div>
                </div>
                <p class="q-mt-sm text-grey-8">{{ category.description }}</p>
              </q-card-section>
              <q-card-actions class="q-px-md q-pb-md">
                <q-btn unelevated color="primary" :label="category.cta" :to="category.to" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <section class="spotlight-band">
      <div class="page-shell">
        <div class="section-heading">
          <div>
            <q-badge color="secondary" text-color="dark" label="Featured picks" />
            <h2>Fresh on campus</h2>
          </div>
          <p>A fast look at items and services already inside the marketplace.</p>
        </div>

        <div class="row q-col-gutter-md">
          <div v-for="item in featured" :key="item.name" class="col-12 col-sm-6 col-lg-3">
            <q-card class="product-card" flat bordered>
              <q-img :src="item.image" :alt="item.name" ratio="1" />
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
                <div class="text-caption text-grey-7">{{ item.tag }}</div>
                <div class="price q-mt-sm">{{ item.price }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
const categories = [
  {
    title: 'Services',
    description: 'Printing, laminating, runners, and practical help from students nearby.',
    image: '/icons/services.jpg',
    icon: 'design_services',
    cta: 'Find Services',
    to: '/page1',
  },
  {
    title: 'Food & Beverages',
    description: 'Affordable meals, snacks, and quick cravings delivered around campus.',
    image: '/icons/f&b_3.jpg',
    icon: 'restaurant',
    cta: 'See Menu',
    to: '/page2',
  },
  {
    title: 'Thrift',
    description: 'Pre-loved streetwear, jerseys, sneakers, and accessories with character.',
    image: '/icons/thrift.jpg',
    icon: 'checkroom',
    cta: 'Shop Thrift',
    to: '/page3',
  },
]

const featured = [
  { name: 'Takoyaki', tag: 'Food & Beverages', price: 'From RM5', image: '/icons/f&b_2.jpg' },
  {
    name: 'Printing & Laminate',
    tag: 'Services',
    price: 'Price list available',
    image: '/icons/services_2.jpg',
  },
  { name: 'Brazil Jersey', tag: 'Thrift', price: 'Student deal', image: '/icons/item_2.jpg' },
  { name: 'Personal Runner', tag: 'Services', price: 'From RM3', image: '/icons/services_3.jpg' },
]
</script>
