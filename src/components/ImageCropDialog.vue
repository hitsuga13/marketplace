<!-- Purpose: Reusable image crop dialog for profile pictures, product photos, and seller payment QR images. -->
<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="emit('update:modelValue', $event)">
    <q-card class="image-crop-card">
      <q-card-section class="image-crop-header">
        <q-btn flat round dense icon="arrow_back" @click="close" />
        <div class="image-crop-title">{{ title }}</div>
        <div class="image-crop-spacer"></div>
      </q-card-section>

      <q-card-section class="image-crop-body">
        <div
          ref="frameRef"
          :class="['image-crop-frame', `image-crop-frame--${shape}`]"
          @pointerdown="startDrag"
          @pointermove="dragImage"
          @pointerup="endDrag"
          @pointercancel="endDrag"
          @pointerleave="endDrag"
        >
          <img
            v-if="source"
            ref="imageRef"
            :src="source"
            alt="Image crop preview"
            :style="previewStyle"
            draggable="false"
            @load="resetCrop"
          />
        </div>

        <div class="image-crop-controls">
          <q-btn
            round
            unelevated
            icon="remove"
            @pointerdown.prevent="startZoomHold(-0.02)"
            @pointerup="stopZoomHold"
            @pointercancel="stopZoomHold"
            @pointerleave="stopZoomHold"
          />
          <q-btn
            round
            unelevated
            icon="add"
            @pointerdown.prevent="startZoomHold(0.02)"
            @pointerup="stopZoomHold"
            @pointercancel="stopZoomHold"
            @pointerleave="stopZoomHold"
          />
          <q-btn unelevated label="Reset" no-caps @click="resetCrop" />
        </div>
        <div class="image-crop-hint">Drag the image anywhere. Use minus to zoom out until the full picture is visible.</div>

        <q-btn
          flat
          no-caps
          label="Select another photo"
          class="image-crop-secondary"
          @click="emit('select-another')"
        />
        <q-btn
          unelevated
          color="dark"
          no-caps
          label="Confirm"
          class="image-crop-confirm"
          @click="confirmCrop"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: '',
  },
  shape: {
    type: String,
    default: 'square',
    validator: (value) => ['square', 'circle'].includes(value),
  },
  title: {
    type: String,
    default: 'Preview',
  },
  outputSize: {
    type: Number,
    default: 720,
  },
  quality: {
    type: Number,
    default: 0.72,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'select-another'])

const frameRef = ref(null)
const imageRef = ref(null)
const zoom = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const dragState = ref(null)
const zoomHoldTimeout = ref(null)
const zoomHoldInterval = ref(null)

const previewStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${zoom.value})`,
}))

const resetCrop = () => {
  zoom.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

const close = () => {
  stopZoomHold()
  emit('update:modelValue', false)
}

const changeZoom = (amount) => {
  zoom.value = Math.min(3.2, Math.max(0.35, Number((zoom.value + amount).toFixed(2))))
}

const clearZoomTimers = () => {
  if (zoomHoldTimeout.value) {
    window.clearTimeout(zoomHoldTimeout.value)
    zoomHoldTimeout.value = null
  }

  if (zoomHoldInterval.value) {
    window.clearInterval(zoomHoldInterval.value)
    zoomHoldInterval.value = null
  }
}

const startZoomHold = (amount) => {
  clearZoomTimers()
  changeZoom(amount)
  zoomHoldTimeout.value = window.setTimeout(() => {
    zoomHoldInterval.value = window.setInterval(() => changeZoom(amount), 90)
  }, 220)
}

const stopZoomHold = () => {
  clearZoomTimers()
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) stopZoomHold()
  },
)

onBeforeUnmount(stopZoomHold)

const startDrag = (event) => {
  if (!props.source) return
  event.currentTarget.setPointerCapture?.(event.pointerId)
  dragState.value = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    baseX: offsetX.value,
    baseY: offsetY.value,
  }
}

const dragImage = (event) => {
  if (!dragState.value || dragState.value.pointerId !== event.pointerId) return
  offsetX.value = dragState.value.baseX + event.clientX - dragState.value.startX
  offsetY.value = dragState.value.baseY + event.clientY - dragState.value.startY
}

const endDrag = (event) => {
  if (dragState.value?.pointerId === event.pointerId) dragState.value = null
}

const confirmCrop = () => {
  const frame = frameRef.value
  const image = imageRef.value
  if (!frame || !image || !props.source) return

  const frameSize = frame.clientWidth || 320
  const outputSize = props.outputSize
  const cropRatio = props.shape === 'circle' ? 0.68 : 0.86
  const cropSize = frameSize * cropRatio
  const cropLeft = (frameSize - cropSize) / 2
  const cropTop = (frameSize - cropSize) / 2
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const scaleToOutput = outputSize / cropSize
  const baseScale = Math.min(frameSize / image.naturalWidth, frameSize / image.naturalHeight)
  const imageScale = baseScale * zoom.value * scaleToOutput
  const drawnWidth = image.naturalWidth * imageScale
  const drawnHeight = image.naturalHeight * imageScale
  const imageFrameLeft = (frameSize - image.naturalWidth * baseScale * zoom.value) / 2 + offsetX.value
  const imageFrameTop = (frameSize - image.naturalHeight * baseScale * zoom.value) / 2 + offsetY.value
  const left = (imageFrameLeft - cropLeft) * scaleToOutput
  const top = (imageFrameTop - cropTop) * scaleToOutput

  canvas.width = outputSize
  canvas.height = outputSize
  context.fillStyle = '#f8faff'
  context.fillRect(0, 0, outputSize, outputSize)

  if (props.shape === 'circle') {
    context.save()
    context.beginPath()
    context.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    context.clip()
  }

  context.drawImage(image, left, top, drawnWidth, drawnHeight)

  if (props.shape === 'circle') context.restore()

  // Compress cropped images before saving them as base64 so database/storage quota lasts longer.
  const safeQuality = Math.min(0.9, Math.max(0.45, props.quality))

  emit('confirm', canvas.toDataURL('image/jpeg', safeQuality))
  emit('update:modelValue', false)
}
</script>
