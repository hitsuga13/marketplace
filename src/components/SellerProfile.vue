<!-- Community-facing seller profile, schedule, pickup details, and buyer reviews. -->
<template>
  <section class="seller-profile">
    <q-card flat bordered class="seller-profile__header">
      <q-card-section>
        <div class="row items-start justify-between q-col-gutter-md">
          <div class="col-12 col-sm">
            <div class="row items-center q-gutter-sm">
              <div class="text-h5 text-weight-bold">
                {{ displaySeller?.name || 'Seller profile' }}
              </div>
              <q-btn
                v-if="isOwner"
                flat
                dense
                color="primary"
                icon="edit"
                label="Edit profile"
                @click="openEditDialog"
              />
            </div>
            <div class="text-body2 text-grey-7 q-mt-xs">
              Community trust is based on buyer feedback and completed orders.
            </div>

            <q-expansion-item
              icon="schedule"
              :label="businessStatus.label"
              :caption="todayHoursText"
              header-class="q-mt-sm text-weight-medium"
            >
              <q-list dense class="q-pl-md">
                <q-item v-for="day in days" :key="day.key">
                  <q-item-section>{{ day.label }}</q-item-section>
                  <q-item-section side>{{ scheduleText(schedule[day.key]) }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-chip icon="place" color="grey-2" text-color="grey-9" class="q-mt-sm">
              {{
                displaySeller?.pickup_address ||
                displaySeller?.pickupAddress ||
                'Pickup location not provided'
              }}
            </q-chip>
            <q-chip icon="receipt_long" color="primary" text-color="white" class="q-mt-sm">
              {{
                displaySeller?.completed_orders_count || displaySeller?.completedOrdersCount || 0
              }}
              completed orders
            </q-chip>
          </div>

          <div class="col-12 col-sm-auto text-sm-right">
            <div class="text-subtitle2">Buyer rating</div>
            <q-rating v-model="avgRating" readonly max="5" size="2em" color="gold" />
            <div class="text-caption text-grey-7">
              {{ avgRating.toFixed(1) }} / 5 · {{ reviewCount }} reviews
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-if="canReview" flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Leave a review</div>
        <div class="text-caption text-grey-7">
          Share your experience to help other buyers decide.
        </div>
        <q-rating v-model="newRating" max="5" size="2em" color="gold" class="q-mt-sm" />
        <q-input
          v-model="newComment"
          outlined
          type="textarea"
          autogrow
          label="Your review"
          maxlength="1000"
          class="q-mt-sm"
        />
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          unelevated
          color="primary"
          label="Submit review"
          :loading="submitting"
          :disable="newRating === 0 || !newComment.trim()"
          @click="submitReview"
        />
      </q-card-actions>
    </q-card>

    <q-banner v-else-if="buyerId" class="bg-grey-2 text-grey-8 q-mt-md"
      >You cannot review your own store.</q-banner
    >

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Customer reviews</div>
        <q-list v-if="reviews.length" separator class="q-mt-sm">
          <q-item v-for="review in reviews" :key="review.id">
            <q-item-section avatar
              ><q-avatar color="primary" text-color="white">{{
                buyerInitial(review)
              }}</q-avatar></q-item-section
            >
            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                review.buyer?.name || 'Buyer'
              }}</q-item-label>
              <q-item-label caption>{{ formatDate(review.created_at) }}</q-item-label>
              <q-rating :model-value="review.rating" readonly max="5" size="1.25em" color="gold" />
              <q-item-label class="q-mt-xs" style="white-space: pre-wrap">{{
                review.comment
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-banner v-else class="bg-grey-2 text-grey-8 q-mt-md"
          >No reviews yet. Be the first buyer to share feedback.</q-banner
        >
      </q-card-section>
    </q-card>

    <q-dialog v-model="editDialog">
      <q-card class="full-width" style="max-width: 650px">
        <q-card-section>
          <div class="text-h6">Edit store profile</div>
          <div class="text-caption text-grey-7">
            Set a pickup location and apply the same hours to multiple days.
          </div>
          <q-input v-model="pickupAddress" outlined label="Pickup location" class="q-mt-md" />

          <div class="text-subtitle1 text-weight-medium q-mt-lg">Business hours</div>
          <div class="row q-col-gutter-sm q-mt-xs">
            <div v-for="day in days" :key="day.key" class="col-6 col-sm-4">
              <q-checkbox v-model="selectedDays" :val="day.key" :label="day.label" />
            </div>
          </div>
          <q-toggle v-model="markClosed" label="Mark selected days as closed" class="q-mt-sm" />
          <div v-if="!markClosed" class="row q-col-gutter-sm q-mt-sm">
            <div class="col-6">
              <q-input v-model="batchOpen" outlined type="time" label="Open time" />
            </div>
            <div class="col-6">
              <q-input v-model="batchClose" outlined type="time" label="Close time" />
            </div>
          </div>
          <q-btn
            outline
            color="primary"
            label="Set selected days"
            class="q-mt-md"
            :disable="selectedDays.length === 0"
            @click="setSelectedDays"
          />

          <q-list bordered separator class="q-mt-md rounded-borders">
            <q-item v-for="day in days" :key="day.key">
              <q-item-section>{{ day.label }}</q-item-section>
              <q-item-section side>{{ scheduleText(editSchedule[day.key]) }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat color="grey-7" label="Cancel" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Save profile"
            :loading="savingProfile"
            @click="saveProfile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { isSupabaseConfigured, supabase } from 'src/supabase/client'

const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]
const defaultSchedule = () =>
  Object.fromEntries(
    days.map((day) => [
      day.key,
      {
        isOpen: day.key !== 'sunday',
        open: day.key !== 'sunday' ? '08:00' : '',
        close: day.key !== 'sunday' ? '22:00' : '',
      },
    ]),
  )
const normaliseSchedule = (value) => {
  let parsed = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      parsed = null
    }
  }
  const fallback = defaultSchedule()
  return Object.fromEntries(
    days.map((day) => {
      const item = parsed?.[day.key]
      return [
        day.key,
        item && typeof item === 'object'
          ? { isOpen: Boolean(item.isOpen), open: item.open || '', close: item.close || '' }
          : fallback[day.key],
      ]
    }),
  )
}

const props = defineProps({
  sellerId: { type: [String, Number], required: true },
  buyerId: { type: [String, Number], default: '' },
  viewerId: { type: [String, Number], default: '' },
  fallbackSeller: { type: Object, default: null },
})
const emit = defineEmits(['review-submitted', 'profile-updated'])
const $q = useQuasar()
const seller = ref(null)
const reviews = ref([])
const avgRating = ref(0)
const reviewCount = ref(0)
const newRating = ref(0)
const newComment = ref('')
const submitting = ref(false)
const editDialog = ref(false)
const savingProfile = ref(false)
const editSchedule = ref(defaultSchedule())
const selectedDays = ref(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
const batchOpen = ref('08:00')
const batchClose = ref('22:00')
const markClosed = ref(false)
const pickupAddress = ref('')

const displaySeller = computed(() => seller.value || props.fallbackSeller)
const schedule = computed(() =>
  normaliseSchedule(displaySeller.value?.business_hours || displaySeller.value?.businessHours),
)
const isOwner = computed(
  () => Boolean(props.viewerId) && String(props.viewerId) === String(props.sellerId),
)
const canReview = computed(
  () => Boolean(props.buyerId) && String(props.buyerId) !== String(props.sellerId),
)
const todayKey = () =>
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    new Date().getDay()
  ]
const formatTime = (value) => {
  if (!value) return ''
  const [hour, minute] = value.split(':').map(Number)
  const suffix = hour >= 12 ? 'pm' : 'am'
  return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, '0')}` : ''} ${suffix}`
}
const scheduleText = (entry) =>
  !entry?.isOpen ? 'Closed' : `${formatTime(entry.open)} – ${formatTime(entry.close)}`
const todayHoursText = computed(() => `Today: ${scheduleText(schedule.value[todayKey()])}`)
const businessStatus = computed(() => {
  const entry = schedule.value[todayKey()]
  const now = new Date()
  const current = now.getHours() * 60 + now.getMinutes()
  const minutes = (value) => {
    const [hour, minute] = (value || '').split(':').map(Number)
    return hour * 60 + minute
  }
  const open =
    entry?.isOpen &&
    entry.open &&
    entry.close &&
    current >= minutes(entry.open) &&
    current < minutes(entry.close)
  return { label: open ? '🟢 Open now' : '🔴 Closed' }
})
const formatDate = (date) =>
  new Intl.DateTimeFormat('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(date),
  )
const buyerInitial = (review) => (review.buyer?.name || 'B').charAt(0).toUpperCase()
const notify = (options) => {
  try {
    if (typeof $q.notify === 'function') return $q.notify(options)
  } catch (error) {
    console.error('Unable to show notification:', error)
  }
  console.error(options.message)
}
const showError = (message) => notify({ type: 'negative', message, position: 'top' })

const loadProfile = async () => {
  if (!isSupabaseConfigured || !supabase || !props.sellerId) return
  try {
    const [profileResult, ratingsResult, reviewsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, business_hours, pickup_address, completed_orders_count')
        .eq('id', props.sellerId)
        .maybeSingle(),
      supabase
        .from('seller_ratings')
        .select('average_rating, review_count')
        .eq('seller_id', props.sellerId)
        .maybeSingle(),
      supabase
        .from('reviews')
        .select('id, rating, comment, created_at, buyer:profiles!reviews_buyer_id_fkey(name)')
        .eq('seller_id', props.sellerId)
        .order('created_at', { ascending: false }),
    ])
    const error = profileResult.error || ratingsResult.error || reviewsResult.error
    if (error) throw error
    seller.value = profileResult.data
    avgRating.value = Number(ratingsResult.data?.average_rating || 0)
    reviewCount.value = Number(ratingsResult.data?.review_count || 0)
    reviews.value = reviewsResult.data || []
  } catch (error) {
    showError(`Unable to load seller profile: ${error.message}`)
  }
}

const openEditDialog = () => {
  editSchedule.value = normaliseSchedule(schedule.value)
  pickupAddress.value =
    displaySeller.value?.pickup_address || displaySeller.value?.pickupAddress || ''
  editDialog.value = true
}
const setSelectedDays = () => {
  if (!markClosed.value && (!batchOpen.value || !batchClose.value))
    return showError('Choose both an opening and closing time.')
  selectedDays.value.forEach((day) => {
    editSchedule.value[day] = markClosed.value
      ? { isOpen: false, open: '', close: '' }
      : { isOpen: true, open: batchOpen.value, close: batchClose.value }
  })
}
const saveProfile = async () => {
  if (!isOwner.value) return showError('Only the store owner can edit this profile.')
  if (!isSupabaseConfigured || !supabase)
    return showError('Profile editing is unavailable until Supabase is configured.')
  savingProfile.value = true
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ business_hours: editSchedule.value, pickup_address: pickupAddress.value.trim() })
      .eq('id', props.sellerId)
      .select()
      .single()
    if (error) throw error
    seller.value = data
    editDialog.value = false
    emit('profile-updated', data)
    notify({ type: 'positive', message: 'Store profile updated.', position: 'top' })
  } catch (error) {
    showError(error?.message || 'Unable to save the store profile.')
  } finally {
    savingProfile.value = false
  }
}
const submitReview = async () => {
  if (!props.buyerId) return showError('Please log in as a buyer before submitting a review.')
  if (!canReview.value || newRating.value < 1 || !newComment.value.trim()) return
  if (!isSupabaseConfigured || !supabase)
    return showError('Reviews are unavailable until Supabase is configured.')
  submitting.value = true
  try {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!data.session) throw new Error('Please log in before submitting a review.')
    const { error } = await supabase
      .from('reviews')
      .insert({
        seller_id: props.sellerId,
        buyer_id: props.buyerId,
        rating: newRating.value,
        comment: newComment.value.trim(),
      })
    if (error) throw error
    newRating.value = 0
    newComment.value = ''
    await loadProfile()
    emit('review-submitted')
    notify({ type: 'positive', message: 'Thank you for your review.', position: 'top' })
  } catch (error) {
    showError(error?.message || 'Unable to submit your review. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(loadProfile)
watch(() => props.sellerId, loadProfile)
</script>
